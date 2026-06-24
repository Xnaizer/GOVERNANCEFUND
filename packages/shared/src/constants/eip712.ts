export const EIP712_DOMAIN = {
    name: "GovernanceAntiCorruption",
    version: "1",
    chainId: 84532,
    verifyingContract: "0x24A7e58b751e42997c6f5f11165bD7FDcb3a9d80"
} as const;

export const EIP712_TYPES = {
    MilestoneApproval: [
        { name: "programId", type: "uint256" },
        { name: "milestoneIndex", type: "uint256" },
        { name: "milestoneBudget", type: "uint256" },
        { name: "evidenceHash", type: "bytes32" }  
    ]
} as const;