import Link from "next/link";
import { Icon } from "./icons";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Dignity Pass home">
      <span className="brand-symbol">
        <Icon name="pass" size={23} />
      </span>
      Dignity<span className="brand-light">Pass</span>
    </Link>
  );
}
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav aria-label="Main navigation">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/campaign" className="button small">
            Open workspace <Icon name="arrow" size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer container">
      <div>
        <Brand />
        <p>Support, with dignity.</p>
      </div>
      <nav aria-label="Footer">
        <Link href="/how-it-works">User guide</Link>
        <Link href="/privacy">Privacy & trust</Link>
        <Link href="/campaign">Preprod contract</Link>
      </nav>
      <span className="caption">Built on Midnight · Preprod</span>
    </footer>
  );
}
