"use client";
import { useState } from "react";
import { useWorkspace } from "@/components/workspace-provider";
import { LoadingData, PageHeading } from "@/components/workspace";
import { Icon } from "@/components/icons";
export default function ActivityPage() {
  const w = useWorkspace();
  const [filter, setFilter] = useState("issued");
  const [search, setSearch] = useState("");
  const records = w.snapshot
    ? (filter === "issued"
        ? w.snapshot.commitments
        : filter === "revoked"
          ? w.snapshot.revoked
          : w.snapshot.nullifiers
      ).filter((value) => value.includes(search.trim().toLowerCase()))
    : [];
  return (
    <>
      <PageHeading
        eyebrow="PUBLIC RECORDS"
        title="Accountability, without identity."
        description="Current commitments and spent nullifiers from the shared contract."
      />
      {!w.snapshot ? (
        w.loading ? (
          <LoadingData />
        ) : (
          <div className="empty-state">
            Ledger unavailable. Retry using the notice above.
          </div>
        )
      ) : (
        <section className="panel">
          <div className="record-toolbar">
            <div className="segmented" aria-label="Record category">
              {["issued", "revoked", "redeemed"].map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <label className="search-field">
              <span className="sr-only">Filter by public hash</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by public hash"
              />
            </label>
          </div>
          <p className="field-hint">
            {filter === "redeemed"
              ? "Nullifiers cannot be matched to issued commitments from these records alone."
              : "Commitments are public; recipient names are not collected."}{" "}
            These are current ledger sets, not a chronological transaction
            history.
          </p>
          {records.length ? (
            <div className="records">
              {records.map((value) => (
                <div key={value} className="record-row">
                  <Icon name={filter === "redeemed" ? "check" : "pass"} />
                  <code>{value}</code>
                  <span className="status-tag">{filter}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="activity" size={34} />
              <h2>{search ? "No matching records" : `No ${filter} passes`}</h2>
              <p>
                {search
                  ? "Try a different public hash."
                  : "Records appear only after transactions confirm on Midnight."}
              </p>
            </div>
          )}
        </section>
      )}
      <section className="panel section-gap">
        <h2>Confirmed in this session</h2>
        <p>
          Receipts from actions submitted in this browser session. Cleared when
          the page reloads.
        </p>
        {w.receipts.length ? (
          w.receipts.map((r) => (
            <div className="receipt-row" key={r.txId}>
              <strong>{r.action}</strong>
              <code>{r.txId}</code>
              <span>Block {r.blockHeight}</span>
            </div>
          ))
        ) : (
          <div className="empty-state compact">
            <p>No transactions confirmed in this session.</p>
          </div>
        )}
      </section>
    </>
  );
}
