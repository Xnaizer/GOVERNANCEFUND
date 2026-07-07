import { PinataSDK } from "pinata";
import { env } from "./env";

const pinata = new PinataSDK({
    pinataJwt: env.PINATA_JWT,
    pinataGateway: env.PINATA_GATEWAY
});

export { pinata };