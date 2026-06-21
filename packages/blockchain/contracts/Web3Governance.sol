// SPDX-License-Identifier: MIT
pragma solidity 0.8.35;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IRupiahToken.sol";

contract Web3Governance is EIP712, AccessControl {

    using ECDSA for bytes32;

    /**
     * @notice Role definition to get unique hash from each roles.
     * @dev Define each bytes32 hash for ADMIN, VALIDATOR, AUDITOR role
     */
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    /**
     * @notice Lifecycle states of a funding program.
     * @dev Stored as uint8 on-chain.
     *      Order must not change adter development - it would corrupt the existing data.
     *      PENDING : awaiting validator vote.
     *      APPROVED : passed 67% vote, first milestone ready to open.
     *      DRAWABLE : milestone active, PIC can withdraw.
     *      MILESTONE_ACHIEVED : milestone quota spent or finalized, ready for next.
     *      FROZEN : halted by auditor.
     *      COMPLETED : all milestone finished.
     */
    enum ProposalStatus { PENDING, APPROVED, DRAWABLE, MILESTONE_ACHIEVED, FROZEN, COMPLETED }

    /**
     * @notice Core data for a funding program by a PIC.
     * @dev currentAllocatedBalance = active milestone quota not yet withdrawn.
     *      currentMilestone = running index (0-based) of the active milestone.
     *      programHash = SHA-256 seal of web2 data, used for tamper detection.
     */
    struct Proposal {
        bytes32 programHash;
        address picWallet;
        uint256 totalBudget;
        uint256 currentAllocatedBalance;
        uint256 milestoneCount;
        uint256 currentMilestone;
        ProposalStatus status;
    }

    /**
     * @notice A single on-chain record of a PIC withdrawal.
     * @dev recipientName = the third party paid (vendor, worker), not the PIC.
     *      Forms the forensic audit trail for each disbursement.
     */
    struct WithdrawalRecord {
        uint256 timestamp;
        uint256 amount;
        string recipientName;
        string description;
    }

    /**
     * @notice A pending admin governance vote to grant or revoke a role.
     * @dev isDevote = true means revoking access. false means granting a new role.
     *      executed = true permanently locks the vote once the BFT threshold is reached.
     */
    struct RoleVote {
        address candidate;
        bytes32 roleToTarget;
        uint256 voteCount;
        bool isDevote;
        bool executed;
    }

    /**
     * @notice Tracks validator votes to unfreeze a frozen program.
     * @dev executed = true once the 67% threshold is reached and program reverts to DRAWABLE.
     */
    struct UnfreezeAppeal {
        uint256 voteCount;
        bool executed;
    }

    /**
     * @notice EIP-712 type hash for milestone approval signatures.
     * @dev MUST match the type string used by the frontend (wagmi) exactly,
     *      otherwise ecrecover will return the wrong address and verification fails.
     */
    bytes32 private constant MILESTONE_APPROVAL_TYPEHASH = keccak256(
        "MilestoneApproval(uint256 programId,uint256 milestoneIndex,uint256 milestoneBudget,bytes32 evidenceHash)"
    );
    
    // ==========================================
    // TOKEN REFERENCE
    // ==========================================

    /**
     * @notice Reference to the e-IDR Rupiah token contract.
     * @dev Used to call mint() when a PIC executes a withdrawal. Set in constructor.
     */
    IRupiahToken public rupiahToken;

    // ==========================================
    // PROGRAM STORAGE
    // ==========================================

    /// @notice All funding programs, keyed by programId (assigned by PIC from Web2).
    mapping(uint256 => Proposal) public proposals;

    /// @dev Withdrawal history per program. private — accessed via getWithdrawalHistory().
    mapping(uint256 => WithdrawalRecord[]) private withdrawalHistories;

    // ==========================================
    // VALIDATOR PROPOSAL VOTING (BFT)
    // ==========================================

    /// @notice Prevents a validator from voting twice on the same proposal.
    mapping(uint256 => mapping(address => bool)) public hasVotedProposal;

    /// @notice Accumulated approval votes per program, compared against BFT threshold.
    mapping(uint256 => uint256) public proposalVotes;

    /// @notice Total active validators — N for the validator BFT threshold.
    uint256 public totalValidatorsCount;

    // ==========================================
    // UNFREEZE APPEAL VOTING (BFT)
    // ==========================================

    /// @notice Unfreeze appeals per frozen program, keyed by programId.
    mapping(uint256 => UnfreezeAppeal) public unfreezeAppeals;

    /// @notice Prevents a validator from voting twice on the same unfreeze appeal.
    mapping(uint256 => mapping(address => bool)) public hasVotedUnfreeze;

    // ==========================================
    // ANTI-COLLUSION SIGNER TRACKING
    // ==========================================

    /**
     * @notice Tracks signers who already signed a milestone on a given program.
     * @dev historyOfSigners[programId][signer] = true blocks the same signer from
     *      approving a different milestone on the same program.
     */
    mapping(uint256 => mapping(address => bool)) public historyOfSigners;

    // ==========================================
    // ADMIN ROLE GOVERNANCE VOTING (BFT)
    // ==========================================

    /// @notice All admin role-governance votes, keyed by auto-generated voteId.
    mapping(uint256 => RoleVote) public roleVotes;

    /// @notice Prevents an admin from voting twice on the same role vote.
    mapping(uint256 => mapping(address => bool)) public hasVotedRole;

    /// @notice Total active admins — N for the admin BFT threshold.
    uint256 public totalAdminsCount;

    /// @notice Auto-incrementing counter generating a unique voteId per role vote.
    uint256 public roleVoteNonce;

    // ==========================================
    // ADMIN EVENTS
    // ==========================================

    /// @notice Emitted when an admin proposes a new role grant or revoke vote.
    event RoleVoteCreated(uint256 indexed voteId, address indexed candidate, bytes32 roleToTarget, bool isDevote);

    /// @notice Emitted each time an admin casts a vote on a role proposal.
    event RoleVoteCast(uint256 indexed voteId, address indexed admin, uint256 currentVotes);

    /// @notice Emitted when a role is granted to an account through BFT governance.
    event RoleGrantedViaGovernance(bytes32 indexed role, address indexed account);

    /// @notice Emitted when a role is revoked from an account through BFT governance.
    event RoleRevokedViaGovernance(bytes32 indexed role, address indexed account);

    // ==========================================
    // PROPOSAL EVENTS
    // ==========================================

    /// @notice Emitted when a PIC submits a new funding proposal.
    event ProposalSubmitted(uint256 indexed programId, bytes32 programHash, address indexed picWallet);

    /// @notice Emitted each time a validator votes to approve a proposal.
    event ProposalVoted(uint256 indexed programId, address indexed validator, uint256 currentVotes);

    /// @notice Emitted when a proposal reaches the 67% BFT threshold and is approved.
    event ProposalApproved(uint256 indexed programId);

    // ==========================================
    // MILESTONE EVENTS
    // ==========================================

    /// @notice Emitted when a milestone passes EIP-712 verification and becomes DRAWABLE.
    event MilestoneReleased(uint256 indexed programId, uint256 indexed milestoneIndex, uint256 milestoneBudget);

    /// @notice Emitted when a PIC withdrawal is recorded on-chain (forensic audit trail).
    event OnChainWithdrawalLogged(uint256 indexed programId, address indexed picWallet, uint256 amount, string recipient, string description);

    /// @notice Emitted when a PIC finalizes a milestone, cancelling any unused quota.
    event MilestoneFinalized(uint256 indexed programId, uint256 indexed milestoneIndex);

    /// @notice Emitted when the final milestone is reached and the program is fully completed.
    event ProgramCompleted(uint256 indexed programId);

    // ==========================================
    // FREEZE AND UNFREEZE EVENTS
    // ==========================================

    /// @notice Emitted when an auditor force-freezes a program on suspicion of fraud.
    event ProgramForceFrozen(uint256 indexed programId, address indexed auditor);

    /// @notice Emitted when a PIC submits an appeal to unfreeze their program.
    event UnfreezeAppealSubmitted(uint256 indexed programId, address indexed picWallet);

    /// @notice Emitted each time a validator votes on an unfreeze appeal.
    event UnfreezeAppealVoted(uint256 indexed programId, address indexed validator, uint256 currentVotes);

    /// @notice Emitted when an unfreeze appeal reaches the 67% BFT threshold and the program resumes.
    event ProgramUnfrozenViaBFT(uint256 indexed programId);
}