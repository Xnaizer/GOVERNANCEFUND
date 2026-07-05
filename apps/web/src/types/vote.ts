export interface UnfreezeVote {
  approveVotes: number;
  rejectVotes: number;
  appealStartedAt: string | null;
  resolved: boolean;
  picWallet: string;
  txHash: string | null;
}

export interface FreezeOutcome {
  auditorWallet: string;
  outcome: string;
  frozenAt: string;
  resolvedAt: string | null;
  txHash: string | null;
}