"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container closing-section">
      <span className="eyebrow">SOMETHING INTERRUPTED THIS PAGE</span>
      <h1>Let’s try that again.</h1>
      <p>
        If a transaction was in progress, check your wallet activity before
        submitting it again.
      </p>
      <button className="button" onClick={reset}>
        Reload this page
      </button>
      <p>
        <Link className="text-link" href="/campaign">
          Return to campaign
        </Link>
      </p>
    </main>
  );
}
