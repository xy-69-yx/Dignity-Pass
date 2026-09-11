"use client";

import { useState } from "react";
import Link from "next/link";
import { createConnectedSession, detectWallet, MIDNIGHT_NETWORK } from "@/lib/midnight";
import { connectDignityPass } from "@/lib/dignity-pass";
import { DIGNITY_PASS_CONTRACT_ADDRESS } from "@/lib/config";

export default function ContractPage() {
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    setBusy(true);
    setError("");
    setConnected(false);
    try {
      const wallet = await detectWallet();
      if (!wallet) throw new Error("1AM wallet not detected. Install the 1AM browser extension.");
      const api = await wallet.connect(MIDNIGHT_NETWORK);
      const session = await createConnectedSession(api, "/zk/dignity-pass/");
      await connectDignityPass(session);
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="deploy-page">
      <Link className="deploy-back" href="/">← Back to dashboard</Link>
      <div className="deploy-shell">
        <div className="deploy-kicker">MIDNIGHT PREPROD · 1AM</div>
        <h1>Dignity Pass contract</h1>
        <p className="deploy-lede">Connect to our existing campaign. Every contract operation uses this same deployment.</p>
        <section className="address-card">
          <div>
            <p className="deploy-kicker">SHARED PREPROD CONTRACT</p>
            <code>{DIGNITY_PASS_CONTRACT_ADDRESS}</code>
            <button className="copy-address" onClick={async () => {
              try {
                await navigator.clipboard.writeText(DIGNITY_PASS_CONTRACT_ADDRESS);
              } catch {
                setError("Could not copy address. Select and copy it manually.");
              }
            }}>Copy address</button>
          </div>
        </section>
        <section className="deploy-card">
          <div>
            <h2>Connect 1AM</h2>
            <p>Use your wallet on Midnight Preprod to check the existing contract.</p>
            <button className="deploy-button" onClick={connect} disabled={busy}>
              {busy ? "Connecting…" : connected ? "Check connection again" : "Connect to existing contract"}
            </button>
          </div>
        </section>
        {connected && <p className="deploy-status" role="status">Connected. Existing contract verified through the Preprod indexer.</p>}
        {error && <p className="deploy-error" role="alert">{error}</p>}
        <p className="deploy-footnote">Campaign already deployed. Reconnecting does not deploy a new contract. Dashboard issuance and redemption remain demo interactions until transaction controls are integrated.</p>
      </div>
    </main>
  );
}
