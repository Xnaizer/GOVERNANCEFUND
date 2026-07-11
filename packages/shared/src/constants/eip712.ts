export const EIP712_DOMAIN = {
    name: "GovernanceAntiCorruption",
    version: "1",
    chainId: 84532,
    verifyingContract: "0x1D4e8fD4F037830f463C3dCB0272DAcDD8dc7766"
} as const;

export const EIP712_TYPES = {
    MilestoneApproval: [
        { name: "programId", type: "uint256" },
        { name: "milestoneIndex", type: "uint256" },
        { name: "milestoneBudget", type: "uint256" },
        { name: "evidenceHash", type: "bytes32" }  
    ]
} as const;