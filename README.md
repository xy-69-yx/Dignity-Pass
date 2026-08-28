# Dignity Pass

Privacy-preserving aid coupons on Midnight Network. Relief agencies issue one-time passes; recipients redeem them without exposing identity, eligibility details, coupon secrets, or nonce.

Built for **New Moon to Full: Monthly Moonshots on Midnight — Level 4: Waxing Gibbous**.

## Product

Dignity Pass gives aid agencies a private coupon workflow:

1. Agency deploys a campaign contract.
2. Agency issues a commitment for each coupon.
3. Recipient keeps coupon secret and nonce in wallet/private state.
4. Recipient redeems once through a zero-knowledge proof.
5. Shop or verifier learns only that coupon is valid and unused.

No beneficiary name, address, eligibility record, secret, or nonce enters public ledger state.

## Links

Replace marked placeholders before submission.

| Resource | Link |
| --- | --- |
| Live Preprod app | **TODO: add deployed Vercel/host URL** |
| Deploy page | [`/deploy`](./app/deploy/page.tsx) — available at `<app-url>/deploy` |
| Contract address | **TODO: paste indexed Midnight Preprod address** |
| GitHub repository | **TODO: add public repository URL** |
| Product X profile | **TODO: add product X profile URL** |
| Demo video | **TODO: add 1-minute MVP demo URL** |
| CI workflow | [`CI`](./.github/workflows/ci.yml) · [![CI](https://github.com/OWNER/REPOSITORY/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPOSITORY/actions/workflows/ci.yml) — replace `OWNER/REPOSITORY` |
| Compact contract | [`contracts/dignity_pass.compact`](./contracts/dignity_pass.compact) |
| Product proposal | [`proposals.md`](./proposals.md) |

## Level 4 submission checklist

| Requirement | Status | Evidence / action |
| --- | --- | --- |
| Working MVP live on Preprod | **TODO** | Add live app URL above; deploy via `/deploy` |
| Public GitHub repository | **TODO** | Add repository URL above |
| Contract address | **TODO** | Paste indexed Preprod address above |
| README with setup and usage | Done | This file |
| Contract/privacy explanation | Done | [Privacy model](#privacy-model), [Contract](#contract) |
| CI/CD workflow | Done | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) |
| Passing CI run / badge | **TODO** | Push to public repo, confirm run, update badge owner/repository |
| Product X profile | **TODO** | Create profile, add URL above, pin launch post |
| Demo video | **TODO** | Record full MVP flow; add URL above |
| Minimum 15 meaningful commits | **TODO** | Confirm public Git history; do not squash required history |

## Requirements coverage

Repository covers Level 4 implementation requirements:

- MVP dashboard for campaign overview, issuing passes, and verification demo.
- Compact contract with private coupon commitment and campaign-scoped nullifier.
- Browser wallet integration through 1AM.
- Midnight Preprod network configuration.
- Browser-side proving assets under [`public/zk/dignity-pass`](./public/zk/dignity-pass).
- Deploy flow with wallet signing, proving, balancing, submission, and indexer polling.
- Technical documentation, user-facing usage, contract reference, privacy model, architecture, and proposal.
- CI workflow for lint, TypeScript, production build, and Compact compilation.

## Requirements and prerequisites

- Node.js 22+
- npm
- 1AM browser extension, installed and unlocked
- Midnight Preprod selected in 1AM
- Preprod funds sufficient for deployment and transactions
- Compact CLI for local contract compilation; browser app uses checked-in generated assets

Do not commit wallet secrets, agency secrets, coupon secrets, private keys, or `.env` files.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
npm run verify
```

`verify` runs lint, typecheck, and production build. Same checks run in GitHub Actions.

## How to use

### Deploy campaign on Preprod

1. Install and unlock [1AM](https://1am.xyz).
2. Switch 1AM to Midnight `preprod`.
3. Start app with `npm run dev`, or open hosted app.
4. Open `/deploy`.
5. Select **Connect 1AM wallet**.
6. Confirm wallet connection.
7. Select **Deploy through 1AM** and approve wallet requests.
8. Wait for Preprod indexer confirmation.
9. Copy returned contract address and publish it in [Links](#links).

Deployment uses wallet-provided proving, balancing, signing, and submission. No server-side funded deployer wallet or local proof server required.

### Use dashboard

- **Overview:** inspect campaign status, issuance, redemption, and partner-shop presentation.
- **Issue passes:** enter internal reference label. Label is agency UI only; never use name, address, or eligibility detail. Select **Generate private pass**.
- **Verify redemption:** run verification demo. Production wiring should submit `redeem()` with recipient private witness state and read resulting ledger state.

Dashboard includes presentation/demo interactions. Contract deployment is wired to Midnight Preprod; production issue and redemption transaction controls remain next integration work.

## Privacy model

### Public or ledger-visible

- Campaign ID, agency key hash, expiry, maximum coupon count.
- Campaign state: `OPEN`, `PAUSED`, or `CLOSED`.
- Issued coupon commitments.
- Revoked coupon commitments.
- Issued count.
- Campaign-scoped redeemed nullifiers.
- Transaction and contract metadata exposed by Midnight infrastructure.

### Private

- Agency secret used to authenticate agency circuits.
- Coupon secret and coupon nonce.
- Beneficiary identity and contact details.
- Eligibility documents or attributes.
- Mapping between person and coupon commitment.
- Raw private state held by wallet.

### Observer knowledge

Observer can see campaign activity, commitment/nullifier values, transaction timing, and aggregate counts. Observer cannot derive beneficiary identity or coupon secret from these values under intended cryptographic assumptions. Operational metadata such as wallet/network timing can still leak information outside contract privacy; avoid personal data in labels, transaction metadata, or public posts.

### Nullifier design

`redeem()` computes nullifier from campaign ID and private coupon secret/nonce. Contract stores nullifier, not secret or nonce. Same coupon cannot redeem twice. Campaign ID domain-separates nullifiers across campaigns, preventing cross-campaign reuse/linking by this construction.

## Architecture

```text
User browser
  ├─ Next.js UI (app/)
  │    ├─ dashboard presentation
  │    └─ /deploy wallet flow
  ├─ 1AM browser extension
  │    ├─ wallet connection
  │    ├─ proving provider
  │    ├─ transaction balancing/signing
  │    └─ Preprod submission
  ├─ compiled contract + ZK assets
  │    ├─ contracts/managed/dignity-pass
  │    └─ public/zk/dignity-pass
  └─ Midnight Preprod
       ├─ ledger state
       └─ indexer state polling
```

### Code map

| Area | Location | Responsibility |
| --- | --- | --- |
| Dashboard | [`app/page.tsx`](./app/page.tsx) | Overview, issue, verify UI |
| Deployment UI | [`app/deploy/page.tsx`](./app/deploy/page.tsx) | Connect 1AM, deploy, poll indexer |
| Midnight session | [`lib/midnight.ts`](./lib/midnight.ts) | Network, wallet/provider adapters, state polling |
| Contract integration | [`lib/dignity-pass.ts`](./lib/dignity-pass.ts) | Compile contract, build and submit deployment |
| Compact source | [`contracts/dignity_pass.compact`](./contracts/dignity_pass.compact) | Privacy-critical circuits and ledger |
| ZK assets | [`public/zk/dignity-pass`](./public/zk/dignity-pass) | Browser prover/verifier assets |
| CI | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | Lint, typecheck, build, Compact compile |

## Contract

Source: [`contracts/dignity_pass.compact`](./contracts/dignity_pass.compact).

### Constructor

`constructor(agencyKeyHash, campaign, expiry, couponLimit)` initializes public campaign configuration and starts campaign in `OPEN` state. `expiry = 0` means no expiry.

### Circuits

| Circuit | Access | Behavior |
| --- | --- | --- |
| `issueCoupon(commitment)` | Agency | Adds fresh commitment, increments count |
| `revokeCoupon(commitment)` | Agency | Marks issued commitment revoked |
| `pause()` | Agency | Stops issuance and redemption |
| `resume()` | Agency | Reopens paused campaign before expiry |
| `closeCampaign()` | Agency | Permanently closes campaign |
| `redeem()` | Recipient | Proves issued, non-revoked, unused coupon; stores nullifier |
| `isIssued(commitment)` | Read-only | Checks issued and not revoked |
| `isRedeemed(nullifier)` | Read-only | Checks nullifier spent |
| `campaignExpiry()` | Read-only | Returns expiry; zero means none |
| `totalIssued()` | Read-only | Returns aggregate issued count |

### Agency authentication

Agency authentication compares public `agencyKey` with `agencyPublicKey(agencySecret())`. Only hash public; agency secret stays in witness/private wallet state.

### Build contract locally

Install Compact CLI, then compile with CI version:

```bash
compact update 0.31.1
mkdir -p /tmp/dignity-pass-compiled
compact compile +0.31.1 contracts/dignity_pass.compact /tmp/dignity-pass-compiled
```

Generated browser assets checked in because frontend loads them at runtime.

## CI/CD

GitHub Actions workflow: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

Every push to `main` and every pull request runs:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Compact compiler installation and contract compilation

Hosting is separate from CI. Configure Vercel or another host to build with `npm run build`, then add hosted URL to [Links](#links). Never put wallet credentials in CI or hosting environment variables.

## Limitations and next steps

- Issue and redemption UI currently demonstrates product flows; wire wallet-backed `issueCoupon()` and `redeem()` calls before real aid distribution.
- Private state import/export methods intentionally not implemented; add encrypted backup before production use.
- Add contract integration tests and frontend tests before production launch.
- Replace dashboard sample metrics with indexed contract state.
- Add rate limits, agency key rotation policy, recovery process, and operational privacy guidance.

## License

No license declared yet. Add `LICENSE` before accepting external contributions.
