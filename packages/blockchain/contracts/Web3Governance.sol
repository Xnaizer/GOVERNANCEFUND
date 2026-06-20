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
}