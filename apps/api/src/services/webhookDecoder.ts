import { decodeEventLog, type Abi } from "viem";
import { Web3GovernanceABI, TrustedGatewayBurnerABI } from "@repo/shared";

const ABIS = [Web3GovernanceABI, TrustedGatewayBurnerABI] as unknown as Abi[];

export interface RawLog {
    topics: `0x${string}`[];
    data: `0x${string}`;
    txHash: string;
    logIndex: number;
}

export interface DecodedLog {
    eventName: string;
    args: Record<string, unknown>;
    txHash: string;
    logIndex: number;
}

export function jsonSafe(value: any): any {
    if (typeof value === "bigint") return value.toString();
    if (Array.isArray(value)) return value.map((item) => jsonSafe(item));
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, jsonSafe(v)]));
    }
    return value;
}

export function decodeGovernanceLog(log: RawLog): DecodedLog | null {
    for (const abi of ABIS) {
        try {
            const decoded = decodeEventLog({
                abi,
                data: log.data,
                topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
            });

            return {
                eventName: decoded.eventName as unknown as string,
                args: jsonSafe(decoded.args ?? {}) as Record<string, unknown>,
                txHash: log.txHash,
                logIndex: log.logIndex,
            };
        } catch {
            // ABI tak cocok → coba berikutnya
        }
    }
    return null;
}


export function extractLogs(payload: any): RawLog[] {
    const logs = payload?.event?.data?.block?.logs;

    if(!Array.isArray(logs)) return [];

    return logs.map((log: any) => ({
        topics: log.topics as `0x${string}`[],
        data: log.data as `0x${string}`,
        txHash: log.transaction?.hash ?? log.transactionHash ?? "",
        logIndex: Number(log.index ?? log.logIndex ?? 0),
    }));
}