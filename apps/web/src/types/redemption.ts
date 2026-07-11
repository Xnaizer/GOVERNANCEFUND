export type RedemptionStatus = "PENDING" | "SETTLED" | "CANCELLED";

export interface RedemptionUser {
  id: string;
  name: string | null;
  username: string;
  walletAddress: string | null;
  profilePictureURL: string | null;
  role: string;
}

export interface RedemptionRow {
  id: string;
  redemptionId: number;
  picWallet: string;
  amount: string;
  status: RedemptionStatus;
  requestedAt: string;
  settledAt: string | null;
  cancelledAt: string | null;
  cancelledByPic: boolean;
  requestTxHash: string | null;
  settleTxHash: string | null;
  cancelTxHash: string | null;
  pic?: RedemptionUser | null;
}

export interface RedemptionStats {
  pending: number;
  settled: number;
  cancelled: number;
  totalSettledAmount: string; // total token dibakar & dicairkan
  totalPendingAmount: string; // escrow berjalan
}
