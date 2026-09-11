import { SiteHeader, SiteFooter } from "@/components/site";
export const metadata = { title: "Privacy & trust · Dignity Pass" };
export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container guide-page">
        <div className="guide-heading">
          <span className="eyebrow">PRIVACY & TRUST</span>
          <h1>
            Proof belongs on chain.
            <br />
            Your story doesn’t.
          </h1>
          <p>
            Privacy has boundaries. Here is exactly what this application
            handles, what becomes public, and what it cannot protect.
          </p>
        </div>
        <div className="privacy-columns">
          <section className="panel">
            <span className="eyebrow">PUBLIC ON MIDNIGHT</span>
            <h2>What observers can read</h2>
            <ul>
              <li>Campaign ID, agency key hash, expiry, and coupon limit.</li>
              <li>Campaign state and total issuance count.</li>
              <li>Issued and revoked coupon commitments.</li>
              <li>Spent redemption nullifiers.</li>
              <li>Transaction metadata, timing, and network activity.</li>
            </ul>
          </section>
          <section className="panel private-panel">
            <span className="eyebrow">PRIVATE INPUTS</span>
            <h2>What is not stored on chain</h2>
            <ul>
              <li>Your coupon secret and random nonce.</li>
              <li>The agency authentication secret.</li>
              <li>
                Names, addresses, eligibility records, and identity documents.
              </li>
            </ul>
            <p>
              The app does not ask for identity documents. Agencies may hold
              separate eligibility records outside this application.
            </p>
          </section>
        </div>
        <div className="guide-content standalone">
          <section>
            <h2>Your browser and wallet</h2>
            <p>
              Pass files are parsed locally. Agency secrets and coupon inputs
              are used by the browser and wallet proving flow; our campaign API
              only queries public state. Secrets are not stored in localStorage
              or sent to the application server. The connected wallet and its
              proving provider remain part of your trust boundary.
            </p>
            <p>
              Pass files are bearer credentials: anyone with the file may redeem
              it. Share them privately and store them securely. Browser
              compromise, screenshots, clipboard capture, and a compromised
              wallet are outside the contract’s protection.
            </p>
          </section>
          <section>
            <h2>Commitments and nullifiers</h2>
            <p>
              The contract commits to a secret and nonce using a campaign
              identifier. Redemption computes a campaign-scoped nullifier and
              rejects one already recorded on the ledger. This prevents using
              the same coupon twice.
            </p>
            <p>
              Current public records do not include a recipient directory. The
              app does not infer which commitment belongs to a spent nullifier.
              An agency that knows a pass’s secrets can compute both, and
              transaction timing or off-chain records may reveal associations.
              This is not a promise of perfect anonymity.
            </p>
          </section>
          <section>
            <h2>Network and service data</h2>
            <p>
              The application server contacts the Midnight indexer to fetch
              public contract state. Your wallet contacts its configured
              providers. Hosting and network services may process normal request
              metadata such as IP addresses. This app does not add analytics,
              advertising trackers, or a beneficiary database.
            </p>
          </section>
          <section>
            <h2>Test network, real transactions</h2>
            <p>
              All contract actions target the configured Midnight Preprod
              address. This is a test-network application, not audited
              production aid infrastructure. Redemption marks a coupon as used;
              it does not transfer funds or guarantee delivery of goods.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
