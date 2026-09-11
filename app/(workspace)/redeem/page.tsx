"use client";
import { useState } from "react";
import { useWorkspace } from "@/components/workspace-provider";
import { PageHeading, WalletHint } from "@/components/workspace";
import { Icon } from "@/components/icons";
import { campaignBlock, type CampaignSnapshot } from "@/lib/campaign";
import type { Coupon } from "@/lib/coupon";
export default function RedeemPage() {
  const w = useWorkspace();
  const [text, setText] = useState("");
  const [pass, setPass] = useState<Coupon | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkTime, setCheckTime] = useState("");
  const [txId, setTxId] = useState("");
  function change(value: string) {
    setText(value);
    setPass(null);
    setError("");
    setTxId("");
  }
  async function check() {
    setChecking(true);
    setError("");
    setPass(null);
    setTxId("");
    try {
      const response = await fetch("/api/campaign", {
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const s: CampaignSnapshot = data;
      const { parseCoupon, bytes32, couponValues } =
        await import("@/lib/coupon");
      const candidate = parseCoupon(text, s.campaignId);
      const values = couponValues(
        bytes32(candidate.secret),
        bytes32(candidate.nonce),
        s.campaignId,
      );
      if (!s.commitments.includes(values.commitment))
        throw new Error("This pass has not been issued on Midnight.");
      if (s.revoked.includes(values.commitment))
        throw new Error("The agency revoked this pass.");
      if (s.nullifiers.includes(values.nullifier))
        throw new Error("This pass has already been redeemed.");
      const blocked = campaignBlock(s);
      if (blocked) throw new Error(blocked);
      setPass(candidate);
      setCheckTime(new Date(s.fetchedAt).toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not check pass.");
    } finally {
      setChecking(false);
    }
  }
  async function redeem() {
    if (!pass) return;
    setError("");
    try {
      const tx = await w.execute({ action: "redeem", coupon: pass });
      setTxId(tx.txId);
      setPass(null);
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Redemption failed.");
      setPass(null);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="FOR PASS HOLDERS"
        title="Your pass. Your privacy."
        description="Check your pass against Midnight, then redeem it once through your wallet."
      />
      <WalletHint />
      <div className="form-layout">
        <section className="panel form-panel">
          <div className="panel-title">
            <Icon name="pass" />
            <h2>Open your private pass</h2>
          </div>
          <p>
            Your file is read in this browser. It is never uploaded to our
            server.
          </p>
          <label htmlFor="pass-file">Choose pass file</label>
          <input
            id="pass-file"
            type="file"
            accept=".json,application/json"
            disabled={checking || w.busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 4096) {
                setError("Pass file must be smaller than 4 KB.");
                setPass(null);
                return;
              }
              try {
                change(await file.text());
              } catch {
                setPass(null);
                setError(
                  "Could not read this file. Choose it again or paste its contents.",
                );
              }
            }}
          />
          <label htmlFor="pass-json">Or paste pass JSON</label>
          <textarea
            id="pass-json"
            value={text}
            onChange={(e) => change(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            rows={7}
            placeholder="Paste the contents of your Dignity Pass file"
            disabled={checking || w.busy}
          />
          <p className="field-hint">
            Keep this file private. It contains everything needed to redeem the
            pass.
          </p>
          <button
            className="button secondary"
            disabled={!text.trim() || checking || w.busy}
            onClick={() => void check()}
          >
            {checking ? "Checking ledger…" : "Check pass on Midnight"}
            <Icon name="check" />
          </button>
          {pass && (
            <div className="notice success" role="status">
              <strong>Issued, unrevoked, and unused.</strong>
              <span>
                Checked at {checkTime}. This check does not reserve or spend the
                pass; final validity is enforced on chain.
              </span>
              <button
                className="button"
                disabled={!w.connected || w.busy}
                onClick={() => void redeem()}
              >
                {w.busy ? "Awaiting confirmation…" : "Redeem on Midnight"}
                <Icon name="arrow" />
              </button>
            </div>
          )}
          {txId && (
            <div className="notice success" role="status">
              <strong>Redemption confirmed.</strong>
              <span>This pass cannot be used again. Transaction ID:</span>
              <code className="hash-block">{txId}</code>
            </div>
          )}
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
        </section>
        <aside className="form-aside">
          <div className="aside-icon">
            <Icon name="check" size={28} />
          </div>
          <h2>Prove a right to support.</h2>
          <p>
            Redemption proves your coupon is issued and unused. Your coupon
            secret and nonce are private witness inputs.
          </p>
          <div className="disclosure-list">
            <span>
              <Icon name="check" />
              Coupon validity
            </span>
            <span>
              <Icon name="check" />
              One-time use
            </span>
            <span>
              <Icon name="lock" />
              Identity stays off ledger
            </span>
          </div>
          <p className="field-hint">
            Redemption records coupon use. This contract does not transfer money
            or settle payments to a shop.
          </p>
        </aside>
      </div>
    </>
  );
}
