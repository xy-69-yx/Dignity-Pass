"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CampaignSnapshot } from "@/lib/campaign";
import type { ConnectedSession } from "@/lib/midnight";
import type { ActionInput } from "@/lib/dignity-pass";

type Receipt = {
  action: string;
  txId: string;
  blockHeight: number;
  timestamp: number;
};
type Workspace = {
  snapshot: CampaignSnapshot | null;
  loading: boolean;
  readError: string;
  refresh: () => Promise<void>;
  connected: boolean;
  walletAddress: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  busy: boolean;
  progress: string;
  error: string;
  receipts: Receipt[];
  execute: (input: ActionInput) => Promise<Receipt>;
};
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<CampaignSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState("");
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const lock = useRef(false);
  const fetching = useRef(false);
  const refresh = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/campaign", {
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Could not load campaign.");
      setSnapshot(data);
      setReadError("");
    } catch (e) {
      setReadError(e instanceof Error ? e.message : "Could not load campaign.");
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 30000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [refresh]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (lock.current) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const connect = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setProgress("Waiting for 1AM wallet…");
    try {
      const { detectWallet, createConnectedSession } =
        await import("@/lib/midnight");
      const wallet = await detectWallet();
      if (!wallet)
        throw new Error(
          "1AM wallet not detected. Install and unlock the extension, then connect again.",
        );
      const api = await wallet.connect("preprod");
      const next = await createConnectedSession(api, "/zk/dignity-pass/");
      const { connectDignityPass } = await import("@/lib/dignity-pass");
      setProgress("Checking the shared Preprod contract…");
      await connectDignityPass(next);
      setSession(next);
      setProgress("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connection failed.");
      setProgress("");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const disconnect = () => {
    if (lock.current) return;
    void session?.providers.privateStateProvider.clear();
    void session?.providers.privateStateProvider.clearSigningKeys();
    setSession(null);
    setProgress("");
    setError("");
  };
  const execute = async (input: ActionInput) => {
    if (lock.current)
      throw new Error("Wait for the current wallet operation to finish.");
    if (!session) throw new Error("Connect your 1AM wallet first.");
    lock.current = true;
    setBusy(true);
    setError("");
    setProgress(
      "Preparing proof, awaiting wallet approval and network confirmation. Keep this tab open.",
    );
    try {
      const { transact } = await import("@/lib/dignity-pass");
      const result = await transact(session, input);
      if (result.public.status !== "SucceedEntirely")
        throw new Error(`Transaction did not succeed: ${result.public.status}`);
      const receipt: Receipt = {
        action: input.action,
        txId: result.public.txId,
        blockHeight: result.public.blockHeight,
        timestamp: result.public.blockTimestamp,
      };
      setReceipts((values) => [receipt, ...values]);
      setProgress(`Confirmed on Midnight · block ${receipt.blockHeight}`);
      await refresh();
      return receipt;
    } catch (e) {
      // SDK errors may carry witness-bearing objects; expose only their message.
      const message =
        e instanceof Error
          ? e.message
          : "Transaction failed. Check wallet activity before retrying.";
      setError(message);
      setProgress("");
      throw new Error(message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <Context.Provider
      value={{
        snapshot,
        loading,
        readError,
        refresh,
        connected: !!session,
        walletAddress: session?.unshieldedAddress ?? "",
        connect,
        disconnect,
        busy,
        progress,
        error,
        receipts,
        execute,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Workspace provider missing.");
  return context;
}
