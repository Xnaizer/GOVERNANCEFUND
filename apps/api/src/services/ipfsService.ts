import { pinata } from "../config/pinata";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

function gatewayUrl(cid: string): string {
  return `https://${env.PINATA_GATEWAY}/ipfs/${cid}`;
}

export async function pinFile(
  buffer: Buffer,
  filename: string,
  mime: string,
): Promise<{ cid: string; gatewayUrl: string }> {
  try {
    const file = new File([buffer], filename, { type: mime });
    const { cid } = await pinata.upload.public.file(file).name(filename);

    return { cid, gatewayUrl: gatewayUrl(cid) };
  } catch (err) {
    throw new AppError(`IPFS upload failed: ${(err as Error).message}`, 502);
  }
}

export async function pinJSON(
  content: object,
  name: string,
): Promise<{ cid: string; gatewayUrl: string }> {
  try {
    const { cid } = await pinata.upload.public.json(content).name(name);
    return { cid, gatewayUrl: gatewayUrl(cid) };
  } catch (err) {
    throw new AppError(`IPFS JSON pin failed: ${(err as Error).message}`, 502);
  }
}
