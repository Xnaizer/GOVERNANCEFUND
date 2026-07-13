import { createHash } from "node:crypto";

export function sha256Hex(buffer: Buffer): `0x${string}` {
  return `0x${createHash("sha256").update(buffer).digest("hex")}`;
}
