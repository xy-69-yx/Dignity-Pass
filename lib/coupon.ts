import {
  CompactTypeBytes,
  CompactTypeVector,
  persistentCommit,
  persistentHash,
} from "@midnight-ntwrk/compact-runtime";
import { DIGNITY_PASS_CONTRACT_ADDRESS } from "./config";

export const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
export function bytes32(value: string): Uint8Array {
  if (typeof value !== "string")
    throw new Error("Expected a 32-byte hexadecimal string.");
  const clean = value.trim().replace(/^0x/, "");
  if (!/^[a-fA-F0-9]{64}$/.test(clean))
    throw new Error("Enter exactly 64 hexadecimal characters (32 bytes).");
  return Uint8Array.from(clean.match(/../g)!, (pair) => parseInt(pair, 16));
}
const vector = (length: number) =>
  new CompactTypeVector(length, new CompactTypeBytes(32));
const domain = (text: string) => {
  const value = new Uint8Array(32);
  value.set(new TextEncoder().encode(text));
  return value;
};
export const agencyHash = (secret: Uint8Array) =>
  hex(persistentHash(vector(2), [domain("dignity-pass:agency:"), secret]));
export function couponValues(
  secret: Uint8Array,
  nonce: Uint8Array,
  campaignId: string,
) {
  const campaign = bytes32(campaignId);
  return {
    commitment: hex(persistentCommit(vector(2), [secret, nonce], campaign)),
    nullifier: hex(
      persistentHash(vector(3), [
        domain("dignity-pass:nullifier:"),
        campaign,
        persistentHash(vector(2), [secret, nonce]),
      ]),
    ),
  };
}
export type Coupon = {
  version: 1;
  network: "preprod";
  contractAddress: string;
  campaignId: string;
  secret: string;
  nonce: string;
};
export function createCoupon(campaignId: string): Coupon {
  bytes32(campaignId);
  return {
    version: 1,
    network: "preprod",
    contractAddress: DIGNITY_PASS_CONTRACT_ADDRESS,
    campaignId,
    secret: hex(crypto.getRandomValues(new Uint8Array(32))),
    nonce: hex(crypto.getRandomValues(new Uint8Array(32))),
  };
}
export function parseCoupon(text: string, campaignId: string): Coupon {
  if (text.length > 4096) throw new Error("Pass file is too large.");
  let pass: Coupon;
  try {
    pass = JSON.parse(text);
  } catch {
    throw new Error("Use the original Dignity Pass JSON file.");
  }
  if (
    !pass ||
    pass.version !== 1 ||
    pass.network !== "preprod" ||
    pass.contractAddress !== DIGNITY_PASS_CONTRACT_ADDRESS ||
    pass.campaignId !== campaignId
  )
    throw new Error(
      "This pass belongs to a different contract, campaign, or network.",
    );
  bytes32(pass.secret);
  bytes32(pass.nonce);
  return pass;
}
