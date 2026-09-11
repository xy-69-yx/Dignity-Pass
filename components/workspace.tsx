"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Brand } from "./site";
import { Icon } from "./icons";
import { useWorkspace } from "./workspace-provider";
import { DIGNITY_PASS_CONTRACT_ADDRESS } from "@/lib/config";
const navigation = [
  ["/campaign", "Campaign", "grid"],
  ["/issue", "Issue passes", "pass"],
  ["/redeem", "Redeem a pass", "check"],
  ["/activity", "Ledger records", "activity"],
  ["/settings", "Campaign controls", "settings"],
] as const;
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const w = useWorkspace();
  return (
    <div className="workspace">
      <aside className="workspace-sidebar">
        <Brand />
        <div className="workspace-label">CAMPAIGN WORKSPACE</div>
        <nav aria-label="Workspace">
          {navigation.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon name={icon} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-end">
          <div className="network-label">
            <span />
            Midnight Preprod
          </div>
          <p>
            One campaign.
            <br />
            One shared contract.
          </p>
          <Link href="/how-it-works">
            Read the guide <Icon name="external" size={14} />
          </Link>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-top">
          <span>
            {navigation.find(([href]) => href === pathname)?.[1] ?? "Workspace"}
          </span>
          <div className="wallet-actions">
            {w.connected && (
              <code title={w.walletAddress}>
                {w.walletAddress.slice(0, 12)}…{w.walletAddress.slice(-6)}
              </code>
            )}
            <button
              className="button small secondary"
              disabled={w.busy}
              onClick={w.connected ? w.disconnect : () => void w.connect()}
            >
              <Icon name="wallet" size={16} />
              {w.connected ? "Disconnect" : "Connect 1AM"}
            </button>
          </div>
        </header>
        <main id="main" className="workspace-content">
          {w.progress && (
            <div className="notice" role="status">
              {w.busy && <span className="spinner" />}
              {w.progress}
            </div>
          )}
          {w.error && (
            <div className="notice error" role="alert">
              {w.error}
            </div>
          )}
          {w.readError && (
            <div className="notice warning" role="alert">
              {w.snapshot ? "Showing last successful reading. " : ""}
              {w.readError}{" "}
              <button onClick={() => void w.refresh()} disabled={w.loading}>
                Retry
              </button>
            </div>
          )}
          {children}
        </main>
        <footer className="workspace-footer">
          Dignity Pass <span>Midnight Preprod · test network</span>
        </footer>
      </div>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function ContractAddress() {
  const [message, setMessage] = useState("");
  return (
    <div className="contract-address">
      <div>
        <span className="caption">SHARED PREPROD CONTRACT</span>
        <code>{DIGNITY_PASS_CONTRACT_ADDRESS}</code>
      </div>
      <button
        className="button small secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(DIGNITY_PASS_CONTRACT_ADDRESS);
            setMessage("Copied");
          } catch {
            setMessage("Select address to copy");
          }
        }}
      >
        {message || "Copy address"}
      </button>
    </div>
  );
}
export function AgencyNotice() {
  const { snapshot } = useWorkspace();
  return snapshot?.placeholderAgency ? (
    <div className="notice warning">
      <strong>Agency authorization needs attention.</strong>
      <span>
        This contract was deployed with a placeholder agency key. Issuance and
        campaign controls require a matching secret. Connecting a wallet alone
        will not authorize these actions.
      </span>
      <Link href="/settings">Inspect campaign key →</Link>
    </div>
  ) : null;
}
export function LoadingData() {
  return (
    <div className="empty-state" role="status">
      <span className="spinner" />
      <h2>Reading Midnight Preprod</h2>
      <p>Campaign data will appear after the indexer responds.</p>
    </div>
  );
}
export function WalletHint() {
  const w = useWorkspace();
  return !w.connected ? (
    <div className="notice">
      <Icon name="wallet" />
      <span>
        Connect 1AM to submit a transaction. Public ledger reads do not need a
        wallet.
      </span>
    </div>
  ) : null;
}
