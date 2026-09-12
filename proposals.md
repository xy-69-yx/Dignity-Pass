# Product Proposals

## Selected proposal: Dignity Pass — private aid coupon redemption

### Problem

Aid programs need prove support issued and redeemed correctly. Traditional coupons expose names, household IDs, eligibility documents, or reusable voucher codes. This creates stigma, safety risk, duplicate claims, and unnecessary data retention.

### Users

- Relief agency: creates campaign, issues coupons, pauses/revokes coupons.
- Beneficiary: receives private coupon secret and redeems once.
- Partner shop: verifies eligibility and unused status without seeing identity.
- Auditor: sees campaign activity, not beneficiary records.

### Solution

Dignity Pass represents each coupon as commitment to private `couponSecret` and `couponNonce`, scoped to one campaign. Recipient calls `redeem()` with private witness values. Contract verifies commitment membership, revocation, expiry, campaign state, and nullifier freshness. Ledger stores only campaign-scoped nullifier after redemption.

### Midnight privacy fit

Selective disclosure is core product behavior:

- Agency secret proves authorization without disclosure.
- Coupon secret and nonce prove possession without disclosure.
- Commitment proves issuance without identifying recipient.
- Nullifier prevents double redemption without exposing coupon secret.
- Public campaign state supports audit without publishing beneficiary data.

### Shared deployment

Preprod: `ce4a192d8ffdbb879bff1da9280e678ad0a7306b6099ebee619f1392ba051deb`.

Deploy once, reconnect on each session, and send all contract transactions to this address. Fresh deployment verified on Preprod with matching agency hash, campaign ID, open state, no expiry, and a 500-pass limit. Wallet-approved live issue/redeem acceptance testing remains.

### MVP scope

- Multi-page public landing, guide, privacy page, and agency/recipient workspace.
- 1AM connection on Midnight Preprod.
- Wallet connection to the existing shared Preprod contract.
- Compact contract for issue, revoke, pause, resume, close, redeem, and read-only checks.
- Checked-in proving/verifying assets.
- CI checks for lint, typecheck, generated-contract tests, build, and Compact compilation.
- Desktop/mobile browser tests and real Preprod public-state reads.
- Setup, usage, privacy, architecture, contract, and proposal docs.

### Acceptance criteria

1. Agency connects 1AM on `preprod`.
2. Agency connects to the existing Preprod campaign.
3. Connection verifies the configured contract through the indexer.
4. Invalid agency cannot call agency-only circuits.
5. Revoked or expired coupon cannot redeem.
6. Same coupon cannot redeem twice.
7. Public ledger contains no beneficiary identity, secret, nonce, or eligibility record.
8. CI passes on every pull request and push to `main`.
9. Hosted MVP, contract address, demo video, and product X profile linked from README.

### Threat model

Protected: beneficiary identity, coupon secret, nonce, eligibility details, agency secret.

Visible: campaign configuration, commitment/nullifier values, aggregate counts, transaction timing, contract metadata.

Out of scope for MVP: wallet compromise, endpoint compromise, traffic analysis, malicious 1AM provider, personal data copied into public labels, and legal compliance for real aid programs.

### Roadmap

#### Phase 1 — Level 4 MVP

- Reuse the deployed Preprod contract for all circuit calls.
- Complete wallet-approved live issuance and redemption acceptance run on fresh deployment.
- Validate wallet-approved live issuance and redemption; UI now calls the generated contract API.
- Keep all metrics and records sourced from the indexer; sample data removed.
- Publish hosted app, contract address, CI badge, demo, and X profile.

#### Phase 2 — production hardening

- Encrypted private-state backup and recovery.
- Expand existing contract and browser tests with a wallet-approved live acceptance run.
- Agency key rotation and campaign recovery policy.
- Role separation for agency issuer and shop verifier.
- Accessibility, localization, mobile wallet UX.

#### Phase 3 — ecosystem

- Multi-campaign agency workspace.
- Partner-shop onboarding and scoped verifier permissions.
- Aggregate impact reports with privacy-preserving statistics.
- Independent security review and operational privacy audit.

## Alternative ideas evaluated

| Idea                        | Fit                | Decision                                           |
| --------------------------- | ------------------ | -------------------------------------------------- |
| Private voting              | Strong privacy fit | Not selected; aid access has clearer current scope |
| Age / eligibility gate      | Strong proof fit   | Future threshold-eligibility module                |
| Private allowlist access    | Strong fit         | Coupon commitment pattern can support it           |
| Confidential credentials    | Strong fit         | Future credential issuer integration               |
| Sealed-bid auction          | Strong fit         | Different user and economic model                  |
| Private payroll / splits    | Strong fit         | Future disbursement product                        |
| Anonymous feedback / survey | Strong fit         | Future impact measurement module                   |

## Level 4 evidence checklist

- [ ] Public GitHub repository.
- [ ] Live Midnight Preprod app.
- [x] Contract address supplied by owner: `ce4a192d8ffdbb879bff1da9280e678ad0a7306b6099ebee619f1392ba051deb` (verify through the app).
- [x] README with setup, usage, current limits, architecture, and testing.
- [ ] CI workflow with passing run.
- [ ] Product X profile linked in README.
- [ ] One-minute MVP demo video.
- [ ] Minimum 15 meaningful commits.
- [ ] Proposal submitted for review.
