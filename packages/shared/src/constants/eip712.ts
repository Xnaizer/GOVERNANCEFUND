export const EIP712_DOMAIN = {
    name: "GovernanceAntiCorruption",
    version: "1",
    chainId: 84532,
    verifyingContract: "0x9528B0c7990a3EdF12c4D49310F5b72f8d82c5De"
} as const;

export const EIP712_TYPES = {
    MilestoneApproval: [
        { name: "programId", type: "uint256" },
        { name: "milestoneIndex", type: "uint256" },
        { name: "milestoneBudget", type: "uint256" },
        { name: "evidenceHash", type: "bytes32" }  
    ]
} as const;