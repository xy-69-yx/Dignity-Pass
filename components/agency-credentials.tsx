"use client";
import { useState } from "react";
import { Icon } from "./icons";
export function AgencyCredentials() {
  const [credentials, setCredentials] = useState<{
    agencySecret: string;
    agencyKeyHash: string;
    campaignId: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const { agencyHash, hex } = await import("@/lib/coupon");
      const agencySecret = crypto.getRandomValues(new Uint8Array(32));
      setCredentials({
        agencySecret: hex(agencySecret),
        agencyKeyHash: agencyHash(agencySecret),
        campaignId: hex(crypto.getRandomValues(new Uint8Array(32))),
      });
      agencySecret.fill(0);
    } catch {
      setError(
        "Credential generation failed. Use a secure browser on HTTPS or localhost.",
      );
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const file = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            network: "preprod",
            purpose:
              "Credentials for a future deployment; not authorized on the current contract",
            ...credentials,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dignity-pass-agency-private.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="panel section-gap">
      <h2>Generate agency credentials</h2>
      <p>
        Create a random agency secret, its correct public hash, and a unique
        campaign ID in your browser. These credentials are for a future
        deployment. They cannot authorize or change the current contract.
      </p>
      {!credentials ? (
        <button
          className="button secondary"
          onClick={() => void generate()}
          disabled={busy}
        >
          {busy ? "Generating…" : "Generate locally"}
          <Icon name="lock" size={16} />
        </button>
      ) : (
        <>
          <label className="caption">NEW PUBLIC AGENCY KEY HASH</label>
          <code className="hash-block">{credentials.agencyKeyHash}</code>
          <p className="field-hint">
            The private secret is included only in the downloaded file. Keep
            that file secure; no server copy is kept.
          </p>
          <div className="hero-actions">
            <button className="button secondary" onClick={download}>
              <Icon name="download" />
              Download private credentials
            </button>
            <button
              className="button text-button"
              onClick={() => setCredentials(null)}
            >
              Clear from page
            </button>
          </div>
        </>
      )}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
