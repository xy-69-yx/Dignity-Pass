"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { createConnectedSession, detectWallet, pollForState } from "@/lib/midnight";
import { deployFreshDignityPass } from "@/lib/dignity-pass";

const AGENCY_KEY_HASH = "c2f67cb115d5d619a030be8ecd35c9fe6896d3e5d03e92eab7eeb1c100d83df8";
const CAMPAIGN_ID = "20b1bb9bd013ee057567509e655214dd8bfd41a7218cba035ef9c6600d900d4f";

export default function DeployPage() {
  const [secret, setSecret] = useState("");
  const [session, setSession] = useState<Awaited<ReturnType<typeof createConnectedSession>> | null>(null);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function connect() {
    setBusy(true); setError("");
    try {
      const wallet = await detectWallet();
      if (!wallet) throw new Error("1AM wallet not detected. Install and unlock 1AM first.");
      const api = await wallet.connect("preprod");
      setSession(await createConnectedSession(api, "/zk/dignity-pass/"));
      setStatus("Wallet connected on Midnight Preprod.");
    } catch (e) { setError(e instanceof Error ? e.message : "Wallet connection failed."); }
    finally { setBusy(false); }
  }

  async function deploy() {
    if (!session) return;
    setBusy(true); setError(""); setAddress("");
    try {
      if (!/^[a-fA-F0-9]{64}$/.test(secret)) throw new Error("Enter agency secret from private/deployment-credentials.json.");
      setStatus("Building deployment with 1AM…");
      const deployed = await deployFreshDignityPass(session, AGENCY_KEY_HASH, CAMPAIGN_ID, secret);
      setAddress(deployed); setStatus("Submitted. Waiting for Midnight Preprod indexer…");
      await pollForState(session.config.indexerUri, deployed, 120);
      setStatus("Deployment indexed on Midnight Preprod.");
      setSecret("");
    } catch (e) { setError(e instanceof Error ? e.message : "Deployment failed. Check 1AM activity before retrying."); setStatus(""); }
    finally { setBusy(false); }
  }

  return <main className="deploy-page"><Link className="deploy-back" href="/">← Back to Dignity Pass</Link><div className="deploy-shell"><div className="deploy-kicker">MIDNIGHT PREPROD · ONE-TIME SETUP</div><h1>Deploy a fresh campaign</h1><p className="deploy-lede">Create correctly initialized campaign replacing current placeholder deployment. Secret stays in browser and wallet flow.</p><div className="deploy-trust"><span>NETWORK <b>preprod</b></span><span>LIMIT <b>500 passes</b></span><span>EXPIRY <b>none</b></span></div><section className="deploy-card"><div className="deploy-step">01</div><div><h2>Review constructor values</h2><p>Values match local deployment package.</p><div className="config-line"><span>Agency key hash</span><code>{AGENCY_KEY_HASH}</code></div><div className="config-line"><span>Campaign ID</span><code>{CAMPAIGN_ID}</code></div><div className="config-line"><span>Max coupons</span><code>500</code></div></div></section><section className="deploy-card"><div className="deploy-step">02</div><div><h2>{session ? "Wallet connected" : "Connect 1AM"}</h2><p>{session ? "Wallet ready to prove, balance, sign, and submit." : "Select Midnight Preprod in 1AM before connecting."}</p><button className="deploy-button" onClick={() => void connect()} disabled={busy || !!session}>{session ? "Connected to Preprod" : busy ? "Connecting…" : "Connect 1AM wallet"}<Icon name="wallet" size={16}/></button></div></section>{session && !address && <section className="deploy-card"><div className="deploy-step">03</div><div><h2>Enter private agency secret</h2><p>Read it from ignored local file. Never paste it into chat or commit it.</p><input className="deploy-secret" type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="64 hexadecimal characters" autoComplete="off" spellCheck={false}/><button className="deploy-button" onClick={() => void deploy()} disabled={busy || !secret}>{busy ? status || "Deploying…" : "Deploy through 1AM"}<Icon name="arrow" size={16}/></button></div></section>}{status && <p className="deploy-status"><i/> {status}</p>}{error && <p className="deploy-error" role="alert">{error}</p>}{address && <section className="address-card"><div className="success-icon">✓</div><div><p className="deploy-kicker">DEPLOYMENT CONFIRMED</p><h2>New contract is live</h2><p>Send this public address to developer so app config can be updated.</p><code>{address}</code><button className="copy-address" onClick={() => navigator.clipboard?.writeText(address)}>Copy address</button></div></section>}<p className="deploy-footnote">Old address remains untouched until new address is verified and configured.</p></div></main>;
}
