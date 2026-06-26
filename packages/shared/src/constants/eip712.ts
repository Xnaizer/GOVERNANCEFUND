export const EIP712_DOMAIN = {
    name: "GovernanceAntiCorruption",
    version: "1",
    chainId: 84532,
    verifyingContract: "0x7024aCA78122CdA4aDbB79b5815C757e83a2a1Da"
} as const;

export const EIP712_TYPES = {
    MilestoneApproval: [
        { name: "programId", type: "uint256" },
        { name: "milestoneIndex", type: "uint256" },
        { name: "milestoneBudget", type: "uint256" },
        { name: "evidenceHash", type: "bytes32" }  
    ]
} as const;