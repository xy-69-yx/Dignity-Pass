"use client";
import Link from "next/link";
import { useWorkspace } from "@/components/workspace-provider";
import {
  AgencyNotice,
  ContractAddress,
  LoadingData,
  PageHeading,
} from "@/components/workspace";
import { Icon } from "@/components/icons";
export default function CampaignPage() {
  const { snapshot: s, loading, refresh, readError } = useWorkspace();
  return (
    <>
      <PageHeading
        eyebrow="CAMPAIGN OVERVIEW"
        title="Support starts here."
        description="Your campaign, read directly from the Midnight ledger."
      >
        <button
          className="button secondary"
          onClick={() => void refresh()}
          disabled={loading}
        >
          <Icon name="refresh" />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </PageHeading>
      <AgencyNotice />
      {!s ? (
        loading ? (
          <LoadingData />
        ) : (
          <div className="empty-state">
            <h2>Campaign unavailable</h2>
            <p>{readError}</p>
          </div>
        )
      ) : (
        <>
          <section className="campaign-status">
            <div>
              <span className={`status-tag ${s.state.toLowerCase()}`}>
                {s.state}
              </span>
              <h2>Dignity Pass campaign</h2>
              <p>
                {s.expiresAt === "0"
                  ? "No expiry set"
                  : `Expires ${new Date(Number(s.expiresAt) * 1000).toLocaleString()}`}{" "}
                · Fixed deployment on Preprod
              </p>
            </div>
            <span className="caption">
              Read {new Date(s.fetchedAt).toLocaleTimeString()}
            </span>
          </section>
          <div className="metrics">
            <article>
              <span>Passes issued</span>
              <strong>{s.issuedCount}</strong>
              <small>Confirmed commitments</small>
            </article>
            <article>
              <span>Passes redeemed</span>
              <strong>{s.nullifiers.length}</strong>
              <small>Spent nullifiers on chain</small>
            </article>
            <article>
              <span>Issuance capacity</span>
              <strong>
                {(BigInt(s.maxCoupons) - BigInt(s.issuedCount)).toString()}
              </strong>
              <small>Of {s.maxCoupons} total passes</small>
            </article>
            <article>
              <span>Passes revoked</span>
              <strong>{s.revoked.length}</strong>
              <small>Revoked commitments</small>
            </article>
          </div>
          <div className="two-columns">
            <section className="panel">
              <div className="panel-title">
                <Icon name="pass" />
                <h2>Issue with care.</h2>
              </div>
              <p>
                Authorize a new pass without adding a beneficiary’s name or
                eligibility documents to the ledger.
              </p>
              <Link className="text-link" href="/issue">
                Issue a pass <Icon name="arrow" />
              </Link>
            </section>
            <section className="panel">
              <div className="panel-title">
                <Icon name="check" />
                <h2>A pass. A single use.</h2>
              </div>
              <p>
                Check your private pass against current ledger state, then
                redeem it through your wallet.
              </p>
              <Link className="text-link" href="/redeem">
                Check & redeem <Icon name="arrow" />
              </Link>
            </section>
          </div>
          <section className="panel ledger-preview">
            <div className="panel-title spread">
              <h2>Public ledger records</h2>
              <Link href="/activity" className="text-link">
                View records <Icon name="arrow" size={16} />
              </Link>
            </div>
            {s.commitments.length === 0 ? (
              <div className="empty-state compact">
                <Icon name="activity" size={30} />
                <h3>No passes issued yet</h3>
                <p>
                  Confirmed commitments will appear here after issuance on
                  Midnight.
                </p>
              </div>
            ) : (
              s.commitments.slice(0, 5).map((c) => (
                <div className="record-row" key={c}>
                  <code>{c}</code>
                  <span className="status-tag">
                    {s.revoked.includes(c) ? "Revoked" : "Issued"}
                  </span>
                </div>
              ))
            )}
          </section>
        </>
      )}
      <ContractAddress />
    </>
  );
}
