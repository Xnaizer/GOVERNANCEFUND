import { useQueryClient } from "@tanstack/react-query";
import { useTxThenSync } from "./useTxThenSync";
import { governanceContract, CHAIN_ID } from "../config/contracts";
import { roleHash, type GovRole } from "../config/roles";

export function useGrantPic() {
  const qc = useQueryClient();
  const tx = useTxThenSync({ onDone: () => qc.invalidateQueries() });
  const grant = (wallet: string) =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "grantPicRole",
      args: [wallet as `0x${string}`],
    });
  const revoke = (wallet: string) =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "revokePicRole",
      args: [wallet as `0x${string}`],
    });
  return { ...tx, grant, revoke };
}

export function useProposeRole() {
  const qc = useQueryClient();
  const tx = useTxThenSync({ onDone: () => qc.invalidateQueries() });
  const propose = (candidate: string, role: GovRole, devote: boolean) =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: devote ? "proposeRoleDevote" : "proposeRoleGrant",
      args: [candidate as `0x${string}`, roleHash(role)],
    });
  return { ...tx, propose };
}

export function useVoteRoleProposal() {
  const qc = useQueryClient();
  const tx = useTxThenSync({ onDone: () => qc.invalidateQueries() });
  const vote = (voteId: number) =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "voteRoleProposal",
      args: [BigInt(voteId)],
    });
  return { ...tx, vote };
}
