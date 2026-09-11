import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site";
import { Icon } from "@/components/icons";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="landing-hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-pass" />
              PRIVATE AID, BUILT ON MIDNIGHT
            </div>
            <h1>
              Support should
              <br />
              leave people
              <br />
              <span>their privacy.</span>
            </h1>
            <p>
              A private pass to the help someone needs.
              <br className="desktop-break" /> Issue once. Redeem once. Keep
              their story theirs.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/campaign">
                Open campaign <Icon name="arrow" />
              </Link>
              <Link className="button text-button" href="/redeem">
                I have a pass <Icon name="arrow" />
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="network-dot" />
              On Midnight Preprod <span className="divider-dot">·</span>{" "}
              Publicly verifiable, privately held
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="A private pass keeps identity off the public ledger"
          >
            <div className="art-caption">
              <span>THE DIGNITY PASS PRINCIPLE</span>
              <Icon name="lock" size={17} />
            </div>
            <div className="pass-illustration">
              <div className="pass-top">
                <div className="pass-wordmark">
                  <Icon name="pass" size={30} />
                  <span>Dignity Pass</span>
                </div>
                <span className="pass-type">
                  PRIVATE
                  <br />
                  BY DESIGN
                </span>
              </div>
              <div className="pass-center">
                <span className="pass-caption">WHAT A PASS PROVES</span>
                <h2>
                  A right
                  <br />
                  to support.
                </h2>
                <div className="pass-check">
                  <Icon name="check" size={17} />
                  One-time use, enforced on chain
                </div>
              </div>
              <div className="pass-perforation">
                <i />
                <span />
                <i />
              </div>
              <div className="pass-bottom">
                <span>WHAT STAYS PRIVATE</span>
                <div>
                  <Icon name="lock" size={16} />
                  <strong>The person behind it.</strong>
                </div>
              </div>
            </div>
            <div className="art-note">
              <span className="note-line" />
              <p>
                A proof of access.
                <br />
                No personal story attached.
              </p>
            </div>
          </div>
        </section>
        <section className="principle-strip">
          <div className="container">
            <span>
              <Icon name="lock" />
              No identity on the ledger
            </span>
            <span>
              <Icon name="pass" />
              One pass, one redemption
            </span>
            <span>
              <Icon name="activity" />
              Verification on Midnight
            </span>
          </div>
        </section>
        <section className="landing-section container">
          <div className="section-intro">
            <span className="eyebrow">A SMALL PASS. A CLEAR PURPOSE.</span>
            <h2>
              Less exposure.
              <br />
              More control.
            </h2>
            <p>
              People shouldn’t have to publish their circumstances to receive
              support. Dignity Pass separates the right to redeem from the
              identity of the person redeeming.
            </p>
          </div>
          <div className="role-grid">
            <article>
              <span className="role-icon">
                <Icon name="pass" size={28} />
              </span>
              <span className="eyebrow">FOR AGENCIES</span>
              <h3>
                Issue support.
                <br />
                Keep trust.
              </h3>
              <p>
                Create one-time passes, manage campaign access, and inspect
                public records without collecting personal details on chain.
              </p>
              <Link href="/issue" className="text-link">
                Agency workspace <Icon name="arrow" />
              </Link>
            </article>
            <article>
              <span className="role-icon">
                <Icon name="check" size={28} />
              </span>
              <span className="eyebrow">FOR PASS HOLDERS</span>
              <h3>
                Carry a pass.
                <br />
                Keep your story.
              </h3>
              <p>
                Hold your own private pass. Check its status, then use your
                wallet to prove it can be redeemed.
              </p>
              <Link href="/redeem" className="text-link">
                Check your pass <Icon name="arrow" />
              </Link>
            </article>
          </div>
        </section>
        <section className="process-section">
          <div className="container">
            <div className="section-intro">
              <span className="eyebrow">HOW SUPPORT MOVES</span>
              <h2>
                Three steps.
                <br />
                One private connection.
              </h2>
              <Link href="/how-it-works" className="text-link">
                Read the full guide <Icon name="arrow" />
              </Link>
            </div>
            <ol className="process-steps">
              <li>
                <span>01</span>
                <div>
                  <h3>An agency issues a pass.</h3>
                  <p>
                    A commitment is recorded on Midnight. The private pass goes
                    directly to its recipient.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>The recipient holds the secret.</h3>
                  <p>
                    The pass file stays with its holder, outside the public
                    ledger.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>A proof records one-time use.</h3>
                  <p>
                    Midnight checks validity and records a nullifier that blocks
                    repeat redemption.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>
        <section className="closing-section container">
          <Icon name="pass" size={44} />
          <h2>
            Make privacy part
            <br />
            of how you give.
          </h2>
          <p>Explore the shared campaign on Midnight Preprod.</p>
          <Link className="button" href="/campaign">
            View the live campaign <Icon name="arrow" />
          </Link>
          <span className="field-hint">
            Preprod deployment. Agency authorization status is shown in the
            workspace.
          </span>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
