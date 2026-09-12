"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { createUnprovenDeployTx, findDeployedContract, submitTxAsync } from "@midnight-ntwrk/midnight-js-contracts";
import {
  Contract,
  type Witnesses,
} from "@/contracts/managed/dignity-pass/contract/index";
import type { ConnectedSession } from "./midnight";
import { DIGNITY_PASS_CONTRACT_ADDRESS, PRIVATE_STATE_ID } from "./config";
import { agencyHash, bytes32, couponValues, type Coupon } from "./coupon";
import { ledger } from "@/contracts/managed/dignity-pass/contract/index";

const ZK_ASSET_PATH = "/zk/dignity-pass/";
export type DignityPassPrivateState = {
  agencySecret?: Uint8Array;
  couponSecret?: Uint8Array;
  couponNonce?: Uint8Array;
};

function privateWitness(
  field: keyof DignityPassPrivateState,
): Witnesses<DignityPassPrivateState>["agencySecret"] {
  return ({ privateState }) => {
    const value = privateState[field];
    if (!(value instanceof Uint8Array) || value.length !== 32) {
      throw new Error(`Private state must contain a 32-byte ${field}.`);
    }
    return [privateState, value];
  };
}

// The generated constructor validates all witness functions even though
// deployment itself does not consume secrets. Circuit calls need private state.
export const witnesses: Witnesses<DignityPassPrivateState> = {
  agencySecret: privateWitness("agencySecret"),
  couponSecret: privateWitness("couponSecret"),
  couponNonce: privateWitness("couponNonce"),
};
const makeCompiledContract = () =>
  CompiledContract.make("dignity_pass", Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(ZK_ASSET_PATH),
  );

export async function deployFreshDignityPass(
  session: ConnectedSession,
  agencyKeyHash: string,
  campaignId: string,
  agencySecret: string,
  expiresAt = 0n,
  maxCoupons = 500n,
) {
  const initialPrivateState: DignityPassPrivateState = { agencySecret: bytes32(agencySecret) };
  const deployment = await (createUnprovenDeployTx as any)(
    { zkConfigProvider: session.providers.zkConfigProvider, walletProvider: session.providers.walletProvider },
    {
      compiledContract: makeCompiledContract(),
      args: [bytes32(agencyKeyHash), bytes32(campaignId), expiresAt, maxCoupons],
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState,
      signingKey: (await import("@midnight-ntwrk/compact-runtime")).sampleSigningKey(),
    },
  );
  const contractAddress = deployment.public.contractAddress;
  await submitTxAsync(session.providers as any, { unprovenTx: deployment.private.unprovenTx });
  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, deployment.private.initialPrivateState);
  await session.providers.privateStateProvider.setSigningKey(contractAddress, deployment.private.signingKey);
  return contractAddress;
}

export async function connectDignityPass(session: ConnectedSession) {
  const provider = session.providers.privateStateProvider;
  provider.setContractAddress(DIGNITY_PASS_CONTRACT_ADDRESS);
  const privateStateId = PRIVATE_STATE_ID;
  if ((await provider.get(privateStateId)) === null) {
    await provider.set(privateStateId, {});
  }
  return findDeployedContract(session.providers as any, {
    compiledContract: makeCompiledContract(),
    contractAddress: DIGNITY_PASS_CONTRACT_ADDRESS,
    privateStateId,
  });
}

export type CampaignAction =
  | "issueCoupon"
  | "redeem"
  | "revokeCoupon"
  | "pause"
  | "resume"
  | "closeCampaign";
export type ActionInput = {
  action: CampaignAction;
  agencySecret?: string;
  commitment?: string;
  coupon?: Coupon;
};

export async function transact(session: ConnectedSession, input: ActionInput) {
  const contractState =
    await session.providers.publicDataProvider.queryContractState(
      DIGNITY_PASS_CONTRACT_ADDRESS,
    );
  if (!contractState)
    throw new Error("Contract not found on Midnight Preprod.");
  const current = ledger(contractState.data);
  const privateState: DignityPassPrivateState = {};
  if (input.action !== "redeem") {
    privateState.agencySecret = bytes32(input.agencySecret ?? "");
    const expected = Array.from(current.agencyKey, (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    if (agencyHash(privateState.agencySecret) !== expected)
      throw new Error(
        "Agency secret does not match this contract. No transaction was submitted.",
      );
  } else {
    if (
      !input.coupon ||
      input.coupon.contractAddress !== DIGNITY_PASS_CONTRACT_ADDRESS ||
      input.coupon.network !== "preprod"
    )
      throw new Error("Pass does not belong to this contract.");
    const campaignId = Array.from(current.campaignId, (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    if (input.coupon.campaignId !== campaignId)
      throw new Error("Pass belongs to a different campaign.");
    privateState.couponSecret = bytes32(input.coupon.secret);
    privateState.couponNonce = bytes32(input.coupon.nonce);
    const values = couponValues(
      privateState.couponSecret,
      privateState.couponNonce,
      campaignId,
    );
    if (!current.issuedCoupons.member(bytes32(values.commitment)))
      throw new Error("Pass has not been issued on this contract.");
    if (current.revokedCoupons.member(bytes32(values.commitment)))
      throw new Error("Pass has been revoked.");
    if (current.redeemedNullifiers.member(bytes32(values.nullifier)))
      throw new Error("Pass has already been redeemed.");
  }
  const provider = session.providers.privateStateProvider;
  provider.setContractAddress(DIGNITY_PASS_CONTRACT_ADDRESS);
  await provider.set(PRIVATE_STATE_ID, privateState);
  try {
    const contract = await connectDignityPass(session);
    switch (input.action) {
      case "issueCoupon":
        return await contract.callTx.issueCoupon(
          bytes32(input.commitment ?? ""),
        );
      case "revokeCoupon":
        return await contract.callTx.revokeCoupon(
          bytes32(input.commitment ?? ""),
        );
      case "redeem":
        return await contract.callTx.redeem();
      case "pause":
        return await contract.callTx.pause();
      case "resume":
        return await contract.callTx.resume();
      case "closeCampaign":
        return await contract.callTx.closeCampaign();
    }
  } finally {
    await provider.set(PRIVATE_STATE_ID, {});
    Object.values(privateState).forEach((value) => value.fill(0));
  }
}
