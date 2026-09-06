"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import type {
  MidnightProvider,
  WalletProvider,
} from "@midnight-ntwrk/midnight-js-types";

export const MIDNIGHT_NETWORK = "preprod" as const;
setNetworkId(MIDNIGHT_NETWORK);

export const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
export const fromHex = (hex: string) => {
  const value = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (value.length % 2) throw new Error("Invalid hex string from wallet.");
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < value.length; i += 2)
    bytes[i / 2] = parseInt(value.slice(i, i + 2), 16);
  return bytes;
};

function privateStateProvider() {
  let scope = "";
  const states = new Map<string, unknown>();
  const keys = new Map<string, unknown>();
  const key = (id: string) => `${scope}:${id}`;
  return {
    setContractAddress: (address: string) => {
      scope = address;
    },
    async set(id: string, state: unknown) {
      states.set(key(id), state);
    },
    async get(id: string) {
      return states.get(key(id)) ?? null;
    },
    async remove(id: string) {
      states.delete(key(id));
    },
    async clear() {
      states.clear();
    },
    async setSigningKey(address: string, value: unknown) {
      keys.set(address, value);
    },
    async getSigningKey(address: string) {
      return keys.get(address) ?? null;
    },
    async removeSigningKey(address: string) {
      keys.delete(address);
    },
    async clearSigningKeys() {
      keys.clear();
    },
    async exportPrivateStates(): Promise<never> {
      throw new Error("Not implemented.");
    },
    async importPrivateStates(): Promise<never> {
      throw new Error("Not implemented.");
    },
    async exportSigningKeys(): Promise<never> {
      throw new Error("Not implemented.");
    },
    async importSigningKeys(): Promise<never> {
      throw new Error("Not implemented.");
    },
  };
}

function publicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);
  return { ...base };
}

export type ConnectedSession = {
  api: any;
  config: any;
  providers: {
    privateStateProvider: ReturnType<typeof privateStateProvider>;
    publicDataProvider: ReturnType<typeof publicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider<any>;
    proofProvider: { proveTx: (tx: any) => Promise<any> };
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  unshieldedAddress: string;
};

export function detectWallet(): Promise<any | null> {
  return new Promise((resolve) => {
    let tries = 0;
    const check = () => {
      const wallet = (window as any).midnight?.["1am"];
      if (wallet) return resolve(wallet);
      if (++tries > 50) return resolve(null);
      window.setTimeout(check, 100);
    };
    check();
  });
}

export async function createConnectedSession(
  api: any,
  zkPath: string,
): Promise<ConnectedSession> {
  setNetworkId(MIDNIGHT_NETWORK);
  const [config, unshielded, shielded] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);
  if (config.networkId !== MIDNIGHT_NETWORK)
    throw new Error(
      `1AM connected to ${config.networkId}; switch wallet to ${MIDNIGHT_NETWORK}.`,
    );
  const zkConfigProvider = new FetchZkConfigProvider(
    new URL(zkPath, window.location.origin).toString(),
    window.fetch.bind(window),
  );
  const provingProvider = await api.getProvingProvider(zkConfigProvider);
  const proofProvider = {
    proveTx: async (tx: any) => {
      const { CostModel } = await import("@midnight-ntwrk/ledger-v8");
      return tx.prove(provingProvider, CostModel.initialCostModel());
    },
  };
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const balanced = await api.balanceUnsealedTransaction(
        toHex(tx.serialize()),
      );
      if (!balanced?.tx)
        throw new Error("balanceUnsealedTransaction returned invalid result");
      const { Transaction } = await import("@midnight-ntwrk/ledger-v8");
      return Transaction.deserialize(
        "signature",
        "proof",
        "binding",
        fromHex(balanced.tx),
      );
    },
  };
  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const result = await api.submitTransaction(toHex(tx.serialize()));
      return typeof result === "string"
        ? result
        : (result?.transactionId ??
            result?.id ??
            toHex(tx.serialize()).slice(0, 64));
    },
  };
  return {
    api,
    config,
    providers: {
      privateStateProvider: privateStateProvider(),
      publicDataProvider: publicDataProvider(
        config.indexerUri,
        config.indexerWsUri,
      ),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress: unshielded.unshieldedAddress,
  };
}

export async function pollForState(
  queryUrl: string,
  address: string,
  maxAttempts = 120,
) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(queryUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query:
          "query($address: HexEncoded!) { contractAction(address: $address) { state } }",
        variables: { address },
      }),
    });
    const data = await res.json();
    const state = data?.data?.contractAction?.state;
    if (state) return state;
    await new Promise((r) => window.setTimeout(r, 2000));
  }
  throw new Error("Contract state not indexed yet.");
}
