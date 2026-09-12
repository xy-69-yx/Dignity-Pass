import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site";
import { Icon } from "@/components/icons";
export const metadata = { title: "How it works · Dignity Pass" };
export default function Guide() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container guide-page">
        <div className="guide-heading">
          <span className="eyebrow">THE USER GUIDE</span>
          <h1>
            A clear path
            <br />
            from issue to use.
          </h1>
          <p>
            Dignity Pass is a one-time coupon system on Midnight Preprod. The
            contract records issuance and redemption; it does not distribute
            money.
          </p>
        </div>
        <div className="guide-layout">
          <nav aria-label="Guide sections">
            <a href="#start">Getting started</a>
            <a href="#agency">For agencies</a>
            <a href="#holder">For pass holders</a>
            <a href="#confirmation">Confirmations</a>
            <a href="#limits">Current limitations</a>
          </nav>
          <div className="guide-content">
            <section id="start">
              <h2>Start with the campaign.</h2>
              <p>
                Open the campaign page to read public state without a wallet.
                Counts, commitments, revocations, and nullifiers come from the
                Preprod indexer. A failed read shows an error; the site never
                substitutes sample data.
              </p>
              <p>
                To submit an action, install and unlock{" "}
                <a href="https://1am.xyz" target="_blank" rel="noreferrer">
                  1AM
                </a>
                , select Midnight Preprod, and connect in the workspace. Your
                wallet needs enough Preprod resources to prove, balance, and
                submit the transaction.
              </p>
              <Link className="text-link" href="/campaign">
                Open campaign <Icon name="arrow" />
              </Link>
            </section>
            <section id="agency">
              <h2>Issue a private pass.</h2>
              <ol>
                <li>Confirm eligibility through your agency’s own process.</li>
                <li>
                  Open Issue passes and enter the agency secret matching the
                  campaign’s on-chain key.
                </li>
                <li>
                  Prepare a pass. The browser generates a random secret and
                  nonce.
                </li>
                <li>
                  Download and securely save the private pass file before
                  issuance.
                </li>
                <li>
                  Issue on Midnight, approve the wallet request, and wait for
                  confirmation.
                </li>
                <li>
                  Deliver the saved file privately to its recipient. Keep it out
                  of public chats and repositories.
                </li>
              </ol>
              <p>
                You may also revoke a commitment, pause or resume the campaign,
                or close it permanently from Campaign controls. These actions
                require the original agency secret.
              </p>
            </section>
            <section id="holder">
              <h2>Check and redeem.</h2>
              <ol>
                <li>Open Redeem a pass.</li>
                <li>
                  Select the JSON file provided by your agency, or paste its
                  contents.
                </li>
                <li>
                  Check the pass against current public ledger state. The file
                  stays in your browser.
                </li>
                <li>Connect your wallet and select Redeem on Midnight.</li>
                <li>Approve the transaction and wait for confirmation.</li>
              </ol>
              <p>
                A check does not reserve the pass. Another holder of the same
                credentials could redeem it first. The contract decides final
                validity and prevents duplicate use.
              </p>
            </section>
            <section id="confirmation">
              <h2>Know when it is done.</h2>
              <p>
                Submitting is not the same as confirming. Keep the tab open
                while the wallet proves and submits. The app displays success
                only when the SDK returns a successful finalized transaction,
                including a transaction ID and block height.
              </p>
              <p>
                If confirmation is interrupted, inspect your wallet’s
                transaction activity and refresh the campaign before retrying. A
                dropped connection does not prove the transaction failed.
              </p>
            </section>
            <section id="limits">
              <h2>Understand the current deployment.</h2>
              <p>
                The fresh shared contract uses a sealed agency key derived from
                the private deployment credentials. Issuance and agency
                controls require that matching secret. The key is sealed and
                this contract has no rotation circuit.
              </p>
              <p>
                Generating new credentials does not change this existing key.
                Keep the original credentials secure and use the verified
                contract address shown in the workspace.
              </p>
              <p>
                Private state is held in memory for each operation, not backed
                up automatically. Save pass files securely. The site has no
                beneficiary directory, partner payment system, or identity
                recovery service.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
