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
     * @notice Statuses for proposal.
     * @dev Define enum for ProposalStatus lifecycle.
     */
    enum ProposalStatus { PENDING, APPROVED, DRAWABLE, MILESTONE_ACHIEVED, FROZEN, COMPLETED }

    /**
     * @notice Struct types for Proposal.
     * @dev Define each attribute with it's types.
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
     * @notice Struct types for Withdrawal Record.
     * @dev Define each attribute with it's types.
     */
    struct WithdrawalRecord {
        uint256 timestamp;
        uint256 amount;
        string recipientName;
        string description;
    }

    /**
     * @notice Struct types for Role Vote.
     * @dev Define each attribute with it's types.
     */
    struct RoleVote {
        address candidate;
        bytes32 roleToTarget;
        uint256 voteCount;
        bool isDevote;
        bool executed;
    }

    /**
     * @notice Struct types for Unfreeze Appeal.
     * @dev Define each attribute with it's types.
     */
    struct UnfreezeAppeal {
        uint256 voteCount;
        bool executed;
    }

    /**
     * @notice Constant milestone approval.
     */
    bytes32 private constant MILESTONE_APPROVAL_TYPEHASH = keccak256(
        "MilestoneApproval(uint256 programId,uint256 milestoneIndex,uint256 milestoneBudget,bytes32 evidenceHash)"
    );
}