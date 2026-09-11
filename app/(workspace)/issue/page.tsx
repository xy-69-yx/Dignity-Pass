"use client";
import { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/components/workspace-provider";
import { AgencyNotice, PageHeading, WalletHint } from "@/components/workspace";
import { Icon } from "@/components/icons";
import { campaignBlock } from "@/lib/campaign";
import type { Coupon } from "@/lib/coupon";

export default function IssuePage() {
  const w = useWorkspace();
  const [secret, setSecret] = useState("");
  const [pass, setPass] = useState<Coupon | null>(null);
  const [commitment, setCommitment] = useState("");
  const [saved, setSaved] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const blocked = w.snapshot
    ? campaignBlock(w.snapshot)
    : "Waiting for campaign data.";
  async function prepare() {
    if (!w.snapshot) return;
    setPreparing(true);
    setError("");
    try {
      const { createCoupon, couponValues, bytes32, agencyHash } =
        await import("@/lib/coupon");
      if (agencyHash(bytes32(secret)) !== w.snapshot.agencyKey)
        throw new Error(
          "Agency secret does not match the on-chain key. Ask the original campaign operator for access.",
        );
      const next = createCoupon(w.snapshot.campaignId);
      setPass(next);
      setCommitment(
        couponValues(bytes32(next.secret), bytes32(next.nonce), next.campaignId)
          .commitment,
      );
      setSaved(false);
      setReceipt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not prepare pass.");
    } finally {
      setPreparing(false);
    }
  }
  function download() {
    if (!pass) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(pass, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `dignity-pass-${commitment.slice(0, 12)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function issue() {
    setError("");
    try {
      const tx = await w.execute({
        action: "issueCoupon",
        agencySecret: secret,
        commitment,
      });
      setReceipt(tx.txId);
      setSecret("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Issuance failed.");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="FOR AGENCIES"
        title="Make room for support."
        description="Issue a one-time pass. Keep the person behind it private."
      />
      <AgencyNotice />
      <WalletHint />
      <div className="form-layout">
        <section className="panel form-panel">
          <span className="eyebrow">NEW PASS</span>
          <h2>Prepare, save, then issue.</h2>
          <p>
            A saved pass contains private bearer credentials. Anyone who has the
            file can redeem it.
          </p>
          {blocked && <div className="notice warning">{blocked}</div>}
          {w.snapshot &&
            BigInt(w.snapshot.issuedCount) >= BigInt(w.snapshot.maxCoupons) && (
              <div className="notice warning">
                Campaign issuance limit reached.
              </div>
            )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void prepare();
            }}
          >
            <label htmlFor="agency-secret">Agency secret</label>
            <input
              id="agency-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="64 hexadecimal characters"
              required
              disabled={w.busy || !!pass}
            />
            <p className="field-hint">
              Used for your proof in this browser session. Never sent to our
              server.
            </p>
            {!pass && (
              <button
                className="button"
                disabled={
                  preparing ||
                  w.busy ||
                  !!blocked ||
                  !w.connected ||
                  !!(
                    w.snapshot &&
                    BigInt(w.snapshot.issuedCount) >=
                      BigInt(w.snapshot.maxCoupons)
                  )
                }
              >
                {preparing ? "Preparing…" : "Prepare private pass"}
                <Icon name="arrow" />
              </button>
            )}
          </form>
          {pass && (
            <div className="pass-prepared">
              <span className="status-tag">
                {receipt
                  ? "CONFIRMED ON MIDNIGHT"
                  : "PREPARED · NOT YET ISSUED"}
              </span>
              <label>Public commitment</label>
              <code className="hash-block">{commitment}</code>
              <button className="button secondary" onClick={download}>
                <Icon name="download" />
                Download private pass
              </button>
              {!receipt && (
                <>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={saved}
                      onChange={(e) => setSaved(e.target.checked)}
                    />
                    I saved the private pass file somewhere secure.
                  </label>
                  <button
                    className="button"
                    disabled={!saved || !w.connected || w.busy || !!blocked}
                    onClick={() => void issue()}
                  >
                    {w.busy ? "Awaiting confirmation…" : "Issue on Midnight"}
                    <Icon name="arrow" />
                  </button>
                </>
              )}
              {receipt && (
                <div className="notice success" role="status">
                  <strong>Pass issued.</strong>
                  <span>
                    Share the saved file privately with its recipient.
                  </span>
                  <code className="hash-block">{receipt}</code>
                  <button
                    onClick={() => {
                      setPass(null);
                      setCommitment("");
                      setReceipt("");
                      setSaved(false);
                    }}
                  >
                    Prepare another pass
                  </button>
                </div>
              )}
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
            <Icon name="lock" size={28} />
          </div>
          <h2>The person stays private.</h2>
          <p>
            Only a commitment is issued to the public ledger. Names, addresses,
            and eligibility records do not belong in a pass.
          </p>
          <ol>
            <li>Verify eligibility through your agency’s process.</li>
            <li>Save the generated pass before submitting.</li>
            <li>After confirmation, deliver it securely to the recipient.</li>
          </ol>
          <Link href="/privacy" className="text-link">
            Understand the privacy model <Icon name="arrow" size={16} />
          </Link>
        </aside>
      </div>
    </>
  );
}
