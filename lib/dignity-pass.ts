"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CompiledContract } from "@midnight-ntwrk/compact-js";
import {
  createUnprovenDeployTx,
  submitTxAsync,
} from "@midnight-ntwrk/midnight-js-contracts";
import { Contract } from "@/contracts/managed/dignity-pass/contract/index";
import type { ConnectedSession } from "./midnight";

const ZK_ASSET_PATH = "/zk/dignity-pass/";
const bytes32 = (hex: string) => {
  const value = hex.replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(value))
    throw new Error("Expected 32-byte hexadecimal value.");
  return Uint8Array.from(value.match(/.{2}/g)!, (pair) => parseInt(pair, 16));
};
const makeCompiledContract = () =>
  CompiledContract.make("dignity_pass", Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(ZK_ASSET_PATH),
  );

export async function deployDignityPass(
  session: ConnectedSession,
  campaignId: string,
  agencyKeyHash: string,
  expiresAt: bigint,
  maxCoupons: bigint,
) {
  const deploy = await (createUnprovenDeployTx as any)(
    {
      zkConfigProvider: session.providers.zkConfigProvider,
      walletProvider: session.providers.walletProvider,
    },
    {
      compiledContract: makeCompiledContract(),
      args: [
        bytes32(agencyKeyHash),
        bytes32(campaignId),
        expiresAt,
        maxCoupons,
      ],
      privateStateId: "dignityPassPrivateState",
      initialPrivateState: {},
      signingKey: (
        await import("@midnight-ntwrk/compact-runtime")
      ).sampleSigningKey(),
    },
  );
  const contractAddress = deploy.public.contractAddress;
  await (submitTxAsync as any)(session.providers, {
    unprovenTx: deploy.private.unprovenTx,
  });
  await session.providers.privateStateProvider.setContractAddress(
    contractAddress,
  );
  await session.providers.privateStateProvider.set(
    "dignityPassPrivateState",
    deploy.private.initialPrivateState,
  );
  await session.providers.privateStateProvider.setSigningKey(
    contractAddress,
    deploy.private.signingKey,
  );
  return contractAddress;
}
