"use client";
import { useState } from "react";
import { useWorkspace } from "@/components/workspace-provider";
import {
  AgencyNotice,
  ContractAddress,
  PageHeading,
  WalletHint,
} from "@/components/workspace";
import type { CampaignAction } from "@/lib/dignity-pass";
import { AgencyCredentials } from "@/components/agency-credentials";
export default function SettingsPage() {
  const w = useWorkspace();
  const [secret, setSecret] = useState("");
  const [commitment, setCommitment] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [txId, setTxId] = useState("");
  async function submit(action: CampaignAction) {
    setError("");
    setTxId("");
    try {
      const tx = await w.execute({ action, agencySecret: secret, commitment });
      setTxId(tx.txId);
      setSecret("");
      setConfirmation("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    }
  }
  const disabled = w.busy || !w.connected || !w.snapshot || !secret.trim();
  return (
    <>
      <PageHeading
        eyebrow="AGENCY CONTROLS"
        title="Careful control, on chain."
        description="Manage the existing campaign. Every change requires the original agency secret."
      />
      <AgencyNotice />
      <WalletHint />
      <ContractAddress />
      <section className="panel section-gap">
        <h2>Campaign configuration</h2>
        <dl className="details-list">
          <div>
            <dt>Network</dt>
            <dd>Midnight Preprod</dd>
          </div>
          <div>
            <dt>State</dt>
            <dd>{w.snapshot?.state ?? "Unavailable"}</dd>
          </div>
          <div>
            <dt>Agency key hash</dt>
            <dd>
              <code>{w.snapshot?.agencyKey ?? "Loading…"}</code>
            </dd>
          </div>
          <div>
            <dt>Campaign ID</dt>
            <dd>
              <code>{w.snapshot?.campaignId ?? "Loading…"}</code>
            </dd>
          </div>
          <div>
            <dt>Coupon limit</dt>
            <dd>{w.snapshot?.maxCoupons ?? "Unavailable"}</dd>
          </div>
          <div>
            <dt>Expiry</dt>
            <dd>
              {w.snapshot
                ? w.snapshot.expiresAt === "0"
                  ? "No expiry"
                  : new Date(
                      Number(w.snapshot.expiresAt) * 1000,
                    ).toLocaleString()
                : "Unavailable"}
            </dd>
          </div>
        </dl>
        <p className="field-hint">
          Agency key, campaign ID, expiry, and coupon limit are sealed at
          deployment. This contract has no key-rotation or configuration-update
          circuit.
        </p>
      </section>
      <section className="panel section-gap form-panel">
        <h2>Authorize a change</h2>
        <label htmlFor="control-secret">Agency secret</label>
        <input
          id="control-secret"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          disabled={w.busy}
          placeholder="64 hexadecimal characters"
        />
        <p className="field-hint">
          Checked against the on-chain key before proving. Never saved to
          browser storage.
        </p>
        <div className="control-row">
          <div>
            <h3>
              {w.snapshot?.state === "PAUSED"
                ? "Resume campaign"
                : "Pause campaign"}
            </h3>
            <p>
              Pausing stops issuance and redemption. Resuming reopens a paused
              campaign before expiry.
            </p>
          </div>
          <button
            className="button secondary"
            disabled={disabled || w.snapshot?.state === "CLOSED"}
            onClick={() =>
              void submit(w.snapshot?.state === "PAUSED" ? "resume" : "pause")
            }
          >
            {w.snapshot?.state === "PAUSED" ? "Resume" : "Pause"}
          </button>
        </div>
        <div className="control-section">
          <h3>Revoke a pass</h3>
          <p>Revocation prevents redemption. It cannot be undone.</p>
          <label htmlFor="revoke-commitment">Issued commitment</label>
          <input
            id="revoke-commitment"
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            spellCheck={false}
            placeholder="64-character public commitment"
            disabled={w.busy}
          />
          <button
            className="button secondary"
            disabled={
              disabled ||
              !/^[a-fA-F0-9]{64}$/.test(commitment) ||
              w.snapshot?.state === "CLOSED"
            }
            onClick={() => {
              if (
                window.confirm(
                  "Permanently revoke this coupon commitment? This cannot be undone.",
                )
              )
                void submit("revokeCoupon");
            }}
          >
            Revoke pass
          </button>
        </div>
        <div className="control-section danger-zone">
          <h3>Permanently close campaign</h3>
          <p>
            Closing stops issuance, redemption, and revocation forever. There is
            no reopen operation.
          </p>
          <label htmlFor="close-confirmation">Type CLOSE to confirm</label>
          <input
            id="close-confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            disabled={w.busy}
          />
          <button
            className="button danger"
            disabled={
              disabled ||
              confirmation !== "CLOSE" ||
              w.snapshot?.state === "CLOSED"
            }
            onClick={() => void submit("closeCampaign")}
          >
            Close campaign permanently
          </button>
        </div>
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        {txId && (
          <div className="notice success" role="status">
            Change confirmed on Midnight.
            <code className="hash-block">{txId}</code>
          </div>
        )}
      </section>
      <AgencyCredentials />
    </>
  );
}
