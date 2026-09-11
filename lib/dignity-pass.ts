"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { Contract, type Witnesses } from "@/contracts/managed/dignity-pass/contract/index";
import type { ConnectedSession } from "./midnight";
import { DIGNITY_PASS_CONTRACT_ADDRESS } from "./config";

const ZK_ASSET_PATH = "/zk/dignity-pass/";
type DignityPassPrivateState = {
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
const witnesses: Witnesses<DignityPassPrivateState> = {
  agencySecret: privateWitness("agencySecret"),
  couponSecret: privateWitness("couponSecret"),
  couponNonce: privateWitness("couponNonce"),
};
const makeCompiledContract = () =>
  CompiledContract.make("dignity_pass", Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(ZK_ASSET_PATH),
  );

export async function connectDignityPass(session: ConnectedSession) {
  const provider = session.providers.privateStateProvider;
  provider.setContractAddress(DIGNITY_PASS_CONTRACT_ADDRESS);
  const privateStateId = "dignityPassPrivateState";
  if ((await provider.get(privateStateId)) === null) {
    await provider.set(privateStateId, {});
  }
  return findDeployedContract(session.providers as any, {
    compiledContract: makeCompiledContract(),
    contractAddress: DIGNITY_PASS_CONTRACT_ADDRESS,
    privateStateId,
  });
}
