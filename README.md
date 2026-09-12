# Dignity Pass

Private, one-time aid coupons on Midnight Preprod. A multi-page Next.js product with public campaign reads, 1AM wallet integration, private pass files, and Compact contract transactions.

## Current deployment status

Shared Preprod address:

```text
ce4a192d8ffdbb879bff1da9280e678ad0a7306b6099ebee619f1392ba051deb
```

Live indexer inspection on 11 September 2026 confirmed an open campaign, a limit of 500, and zero issued coupons. These are observations at inspection time; the app always reads current state.

**Fresh deployment verified on Midnight Preprod.** The sealed agency key matches the generated private deployment credentials. Agency operations require the matching secret from the ignored local credentials file. The app now targets this fresh deployment; the previous placeholder deployment is no longer used.

Public reads work. Transaction controls target this deployment; complete wallet-approved issuance/redemption acceptance testing remains required before production readiness.

## Links

| Resource            | Location                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| GitHub repository   | [xy-69-yx/Dignity-Pass](https://github.com/xy-69-yx/Dignity-Pass)                                                |
| Hosted app          | Pending: add published URL                                                                                       |
| Preprod contract    | Address above; runtime source: [lib/config.ts](lib/config.ts)                                                    |
| CI                  | [Workflow](.github/workflows/ci.yml) · [Runs](https://github.com/xy-69-yx/Dignity-Pass/actions/workflows/ci.yml) |
| Product X profile   | Pending: add product profile URL                                                                                 |
| Demo video          | Pending: record and link real functionality                                                                      |
| Product proposal    | [proposals.md](proposals.md)                                                                                     |
| Architecture        | [docs/architecture.md](docs/architecture.md)                                                                     |
| User guide          | Site route `/how-it-works`                                                                                       |
| Privacy explanation | Site route `/privacy` and section below                                                                          |
| Compact source      | [contracts/dignity_pass.compact](contracts/dignity_pass.compact)                                                 |

## Pages

| Route           | Purpose                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| `/`             | Public landing page explaining the product                                                  |
| `/campaign`     | Live state, counts, contract address, authorization notice                                  |
| `/issue`        | Validate agency credentials, prepare/download a private pass, issue its commitment          |
| `/redeem`       | Import a pass locally, check current state, submit redemption                               |
| `/activity`     | Current issued/revoked commitments, spent nullifiers, session receipts                      |
| `/settings`     | Read sealed configuration; pause, resume, revoke, close; generate future agency credentials |
| `/how-it-works` | Agency and recipient instructions                                                           |
| `/privacy`      | Disclosure boundaries and operational limitations                                           |
| `/deploy`       | Fresh correctly initialized Preprod deployment flow                                        |
| `/api/campaign` | Read-only JSON snapshot from the Preprod indexer                                            |

No sample metrics, partner shops, fake charts, simulated verification, or invented transaction IDs are used. The pass illustration on the homepage explains the privacy model; it is not an issued coupon.

## Setup

Use Node.js 22 or newer and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Public reads require network access to Midnight Preprod; no wallet is needed for browsing campaign state. Use `/deploy` for the fresh replacement deployment.

For transaction submission, install/unlock [1AM](https://1am.xyz), select `preprod`, and fund the wallet with the resources required by its proving/balancing flow. Select **Connect 1AM** in the workspace.

No server wallet or application database is configured. The wallet supplies its proving provider and network configuration. The application uses the [official example's Preprod indexer endpoint](https://github.com/midnightntwrk/example-counter/blob/main/MIGRATION_GUIDE.md), also verified against this deployed contract.

## How to use

### Read the campaign

Open `/campaign`. The app fetches public state on entry, every 30 seconds while visible, and on Refresh. A failed refresh preserves the last successful reading and labels it as stale. It never replaces unavailable data with zero or sample values.

### Issue a pass

This requires the original agency secret matching the deployed agency key.

1. Connect 1AM on Preprod and open `/issue`.
2. Enter the agency secret locally. The browser checks its hash against the ledger.
3. Prepare a pass. Secure browser randomness generates a 32-byte secret and nonce.
4. Download the private JSON file and confirm that you saved it.
5. Select **Issue on Midnight**, approve the wallet request, and wait for finalization.
6. After confirmed issuance, share the saved file privately with its recipient.

The file is saved before submission so an interrupted transaction cannot leave an issued pass with unrecoverable credentials. If confirmation is interrupted, inspect wallet activity and ledger state before retrying. Reusing the same commitment cannot issue a duplicate.

### Redeem a pass

1. Open `/redeem` and choose the pass JSON file or paste its contents.
2. Select **Check pass on Midnight**. Parsing and commitment/nullifier calculation happen locally; the file is not uploaded.
3. The app checks campaign scope, issuance, revocation, prior redemption, state, and expiry.
4. Connect 1AM and select **Redeem on Midnight**.
5. Wait for the finalized transaction ID. A green pre-check does not reserve the pass; the circuit enforces final validity.

Anyone who possesses the file can redeem it. Redemption records coupon use; this contract does not transfer funds or pay shops.

### Campaign controls

Open `/settings`, enter the agency secret, and choose an authorized action. Revocation requires confirmation. Permanent closure requires typing `CLOSE`. Closed campaigns cannot reopen.

Agency key, campaign ID, expiry, and coupon limit are sealed. The credential generator creates correct credentials for a future deployment only; it cannot change this deployment's agency key.

## Privacy model

**Public:** campaign configuration, agency key hash, commitments, revoked commitments, spent nullifiers, aggregate counts, and transaction/network metadata.

**Private inputs:** agency secret, coupon secret, and nonce. Names, addresses, and eligibility evidence are not collected by this application. Agencies can retain separate off-chain eligibility records.

Secrets are passed through browser memory into the wallet proving flow. They are not stored in localStorage or sent to the campaign API. Operation private state is cleared after the call settles. Pass files and generated agency credential files are explicit plaintext downloads and must be stored securely.

The browser, wallet, and its proving provider are trust boundaries. Someone with pass secrets can derive both commitment and nullifier. Timing, wallet activity, and agency records may reveal associations. Do not claim perfect anonymity or unlinkability from all observers.

`redeem()` writes a campaign-scoped nullifier and rejects repeat use. The site displays current ledger sets, not a fabricated chronological history or a guessed commitment-to-nullifier mapping.

## Architecture

```text
Public pages / workspace
  ├─ / → product landing page
  ├─ /campaign → live campaign state
  ├─ /issue → agency pass preparation + issuance
  ├─ /redeem → local pass validation + redemption
  ├─ /activity → public commitments, revocations, nullifiers
  ├─ /settings → agency controls
  ├─ /how-it-works → user guide
  └─ /privacy → privacy and trust boundaries

Read path
  Browser → GET /api/campaign
           → Midnight Preprod indexer
           → decode ContractState with generated ledger accessor
           → public snapshot: state, counts, commitments, revocations, nullifiers

Transaction path
  Browser local input
    → 1AM wallet connection on preprod
    → contract-scoped private state
    → generated Compact witnesses
    → callTx on shared contract address
    → 1AM proving + balancing + signing
    → Midnight submission
    → finalized tx ID + block height
    → clear private state + refresh public snapshot

Trust boundaries
  Agency secret / coupon secret / nonce
    stay in browser memory and wallet proving flow
  Next.js API
    accepts public reads only; never accepts private credentials
  Midnight ledger
    stores public campaign configuration, commitments, revocations,
    issued count, and campaign-scoped redemption nullifiers
```

### Module map

| Module | Responsibility |
| --- | --- |
| `app/page.tsx` | Public landing page and product explanation |
| `app/(workspace)/layout.tsx` | Shared workspace provider and navigation |
| `components/workspace-provider.tsx` | Indexer refresh, wallet connection, operation lock, finalized receipts |
| `app/api/campaign/route.ts` | Fixed-address indexer query and generated-ledger decoding |
| `lib/config.ts` | Shared contract address, Preprod indexer, private-state ID |
| `lib/midnight.ts` | 1AM proving, balancing, signing, and submission adapters |
| `lib/dignity-pass.ts` | Witnesses, deployment, existing-contract connection, circuit dispatch |
| `lib/coupon.ts` | Compact hash/commit derivation and private pass validation |
| `lib/campaign.ts` | Public campaign snapshot and state/expiry checks |
| `contracts/dignity_pass.compact` | Privacy-critical contract source |
| `contracts/managed/dignity-pass` | Generated Compact contract implementation |
| `public/zk/dignity-pass` | Browser proving and verification assets |

### Public reads

Server queries only configured contract address, rejects malformed or failed indexer responses, decodes state with generated ledger accessor, and returns decimal `Uint64` values plus hex commitments/nullifiers. API never accepts private credentials. Responses are uncached with 15-second upstream timeout.

Workspace reads on entry, every 30 seconds while visible, and on demand. Failed refresh preserves last successful snapshot and labels it stale. Initial failure shows unavailable state without zero or sample values. Ledger sets are shown as sets; app does not invent chronological history or commitment-to-nullifier mappings.

### Transaction lifecycle

1. Connect 1AM on Preprod and verify shared contract.
2. Re-read contract state through wallet public provider.
3. Validate agency hash, coupon scope, issuance, revocation, expiry, and replay status locally.
4. Store only required witness bytes in contract-scoped in-memory private state.
5. Invoke generated `callTx` circuit.
6. Wait for `SucceedEntirely`; capture actual transaction ID and block height.
7. Clear private state and refresh public ledger snapshot.

One operation lock prevents witness-state races. Wallet connection does not imply agency authority. SDK errors never produce optimistic success or synthetic transaction IDs. Refresh failure after finalization does not turn confirmed transaction into failed transaction.

### Pass lifecycle

Agency browser generates secret and nonce using `crypto.getRandomValues`. `lib/coupon.ts` uses same Compact runtime descriptors as generated contract. Agency saves private JSON pass before issuance. Recipient imports pass locally; app checks network, address, campaign, commitment, revocation, nullifier, state, and expiry. Redemption writes nullifier and blocks reuse.

Pass and agency credential files are plaintext bearer-secret exports. No automatic server backup, localStorage persistence, or recovery service exists. Anyone holding pass file can redeem it. Session receipts disappear on reload; public ledger records remain queryable.

### Deployment key

Fresh Preprod deployment uses agency hash matching ignored local credentials package. Agency circuits require matching secret. Key cannot change through exposed circuits. Protect local secret and keep encrypted recovery on production roadmap.

### Visual system

Landing signature uses physical aid-pass perforation: public entitlement separated from private identity. Operational pages use quieter data-focused layout.

- Paper `#f7fafb`, ink `#152f40`, glacier `#e3f0f4`, cobalt `#244fc9`, mint `#cee9df`, white `#ffffff`.
- Manrope headings, DM Sans body/UI, IBM Plex Mono public hashes.
- Separate landing, campaign, issue, redeem, records, controls, guide, and privacy routes.
- Visible labels, keyboard focus, semantic controls, mobile navigation, explicit empty/error/pending states, reduced-motion support.
- No invented partner logos, testimonials, impact metrics, or placeholder charts.

Extended version: [docs/architecture.md](docs/architecture.md).

## Contract reference

Constructor: `constructor(agencyKeyHash, campaign, expiry, couponLimit)`. Coupon limit must be positive; expiry `0` disables expiration. Campaign starts open.

| Circuit                    | Authority             | Result                                                            |
| -------------------------- | --------------------- | ----------------------------------------------------------------- |
| `issueCoupon(commitment)`  | Agency secret         | Inserts a fresh commitment while open, unexpired, and below limit |
| `revokeCoupon(commitment)` | Agency secret         | Permanently revokes an issued commitment                          |
| `pause()`                  | Agency secret         | Stops issuance/redemption                                         |
| `resume()`                 | Agency secret         | Reopens a paused campaign before expiry                           |
| `closeCampaign()`          | Agency secret         | Permanently closes the campaign                                   |
| `redeem()`                 | Coupon secret + nonce | Checks validity and writes an unused nullifier                    |
| `isIssued(commitment)`     | Public                | Checks issued and not revoked                                     |
| `isRedeemed(nullifier)`    | Public                | Checks spent nullifier                                            |
| `campaignExpiry()`         | Public                | Returns expiry                                                    |
| `totalIssued()`            | Public                | Returns cumulative issued count                                   |

The UI uses indexer state for read-only checks; it does not spend transaction fees to read a value. All mutation calls use the address in `lib/config.ts`.

Compile with the pinned CI compiler:

```bash
compact update 0.31.1
compact compile +0.31.1 contracts/dignity_pass.compact /tmp/dignity-pass-compiled
```

The checked-in generated contract and `public/zk/dignity-pass` assets must remain consistent with the deployed circuit version.

## Verification

```bash
npm run verify
npx playwright install chromium
npm run test:e2e
```

`verify` runs lint, TypeScript, contract/application tests, and the production build. Contract tests execute generated circuits locally; they are not proof of submitted live transactions.

Browser tests run against a production server on port 3100, covering desktop and 375px mobile layouts, public Preprod reads, invalid pass rejection, wallet absence, local downloads, and explicit indexer failures. The failure-path test intercepts only its test browser request. There is no mock-data switch in the product.

Browser artifacts are written to ignored `test-results/`. Live-read tests require access to Midnight's indexer. CI currently runs lint, typecheck, contract tests, production build, and Compact compilation; browser tests are available separately.

## Hosting

This app needs a Next.js server because `/api/campaign` reads and decodes live ledger state. Do not deploy it as static-only HTML.

```bash
npm run build
npm start
```

Configure a Node-compatible Next.js host with `npm ci` and `npm run build`. Preserve `public/zk` assets and allow outbound HTTPS to the indexer. Use HTTPS for wallet integration and secure browser APIs. No agency secrets or private wallet credentials belong in hosting environment variables.

## Moonshots submission requirements

Based on the supplied Level 3 and Level 4 challenge text:

| Requirement                                     | Evidence / remaining action                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Public repository + complete README/setup/usage | Repository link and this documentation; confirm public visibility                          |
| Meaningful use of Midnight privacy              | Compact witnesses, commitments, and one-time nullifiers                                    |
| 3+ passing tests (Level 3)                      | `npm test`: generated-circuit and pass-validation tests                                    |
| Test output screenshot (Level 3)                | Capture final test output for submission                                                   |
| CI workflow + passing runs                      | Workflow exists; check hosted Actions after pushing                                        |
| Approved proposal from provided idea list       | [proposals.md](proposals.md); approval must be recorded by program                         |
| README privacy model                            | Included above                                                                             |
| Live demo + demo video                          | Publish host and record real workflow; Level 3 asks for a one-minute video                 |
| Working Preprod MVP + address (Level 4)         | Fresh address verified; complete wallet-approved issue/redeem acceptance run            |
| Product X profile in README (Level 4)           | Still required                                                                             |
| 10 / 15 meaningful commits (Level 3 / 4)        | 21 local commits at inspection; reviewers must assess meaningfulness and public history    |

Level 4 expects Level 3 completion and an approved idea. This README records requirements, not program approval or prize eligibility.

## Remaining production work

Complete a wallet-approved live issue/redeem acceptance run, publish hosting and demo evidence, add encrypted credential recovery, and obtain an independent security review. There is no real-funds disbursement, partner registry, or beneficiary identity database.

## License

No license declared. Add a license before inviting external reuse.
