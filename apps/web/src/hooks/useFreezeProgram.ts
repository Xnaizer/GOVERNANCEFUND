import { useTxThenSync } from "./useTxThenSync";
import { governanceContract, CHAIN_ID } from "../config/contracts";
import { fetchProgram } from "../services/explorerApi";

export function useFreezeProgram(programId: number) {
  const tx = useTxThenSync({
    waitForSync: async () =>
      (await fetchProgram(programId)).status === "FROZEN",
  });
  const freeze = () =>
    tx.execute({
      ...governanceContract,
      chainId: CHAIN_ID,
      functionName: "forceFreezeProgram",
      args: [BigInt(programId)],
    });
  return { ...tx, freeze };
}
