# Architecture and design

## Product structure

Public pages explain the product; workspace routes expose actual campaign operations. The root landing page does not load Midnight wallet code. Wallet libraries and WebAssembly are imported when a connection or local cryptographic operation is requested.

| Module                              | Responsibility                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `app/page.tsx`                      | Landing page with a conceptual pass illustration, not a sample issued coupon   |
| `app/(workspace)/layout.tsx`        | Shared session provider and workspace navigation                               |
| `components/workspace-provider.tsx` | Public snapshot refresh, wallet connection, operation lock, finalized receipts |
| `app/api/campaign/route.ts`         | Read-only fixed-address indexer query, decode, public JSON response            |
| `lib/config.ts`                     | Shared contract, public indexer endpoint, private-state ID                     |
| `lib/midnight.ts`                   | 1AM adapters for proving, balancing, and submission                            |
| `lib/dignity-pass.ts`               | Witness functions, existing contract connection, mutation dispatch             |
| `lib/coupon.ts`                     | Typed Compact hash/commit functions and private file validation                |
| `lib/campaign.ts`                   | Public snapshot type and expiry/state guidance                                 |
| `contracts/managed/dignity-pass`    | Generated contract implementation                                              |
| `public/zk/dignity-pass`            | Generated proving and verification assets                                      |

## Public reads

The server queries only the configured contract, rejects failed or malformed indexer responses, and decodes state with the generated ledger accessor. It returns decimal strings for Uint64 values and hex for commitments/nullifiers. It never accepts private credentials. Responses are uncached and have a 15-second upstream timeout.

The workspace polls on entry, every 30 seconds while visible, and on demand. Failed refreshes retain and label the last successful snapshot. Initial failures show unavailable state without numeric defaults. Records are ledger sets rather than an inferred chronology.

## Transactions

1. Connect 1AM on Preprod and verify the existing contract.
2. Before mutations, re-read state through the wallet's public provider.
3. Validate agency hash or coupon scope and status locally.
4. Put only the required witness bytes into contract-scoped in-memory state.
5. Invoke the generated `callTx` method for the shared contract.
6. Wait for `SucceedEntirely`; record actual transaction ID and block height.
7. Clear private state and refresh public data.

One operation at a time prevents witness state races. Wallet connection does not imply agency authority. SDK errors do not trigger optimistic success or synthetic transaction IDs. Refresh errors after finalization do not convert a confirmed transaction into a failed one.

## Pass lifecycle

The agency's browser uses `crypto.getRandomValues` for secret and nonce. Hash/commit descriptors match the generated Compact code; tests issue and redeem those values through the actual compiled circuits. Users save the pass before submission to avoid losing access on a reload. The recipient imports it locally. Campaign/network/address checks prevent using a pass in the wrong deployment.

Plaintext pass and agency downloads are deliberate bearer-secret exports. No automatic secret persistence, server backup, or identity recovery is implemented. Session receipts disappear on reload; public ledger records remain queryable.

## Deployment key

The fresh Preprod deployment uses the agency hash in the ignored local credentials package. Agency circuits require its matching secret. The key cannot be changed by any exposed circuit, so protect the local secret and keep encrypted recovery on the production roadmap.

## Visual system

The design draws on a physical aid pass: its perforation separates public entitlement from private identity. This is the landing page's signature visual; operational pages use a quiet, consistent interface.

- Paper `#f7fafb`, ink `#152f40`, glacier `#e3f0f4`, cobalt `#244fc9`, mint `#cee9df`, white `#ffffff`.
- Manrope for headings, DM Sans for body/UI, IBM Plex Mono for public hashes.
- Separate landing, campaign, issue, redeem, records, controls, guide, and privacy routes.
- Visible labels, keyboard focus, semantic links/buttons, mobile horizontal navigation, explicit empty/error/pending states, and reduced-motion support.
- No invented partner logos, testimonials, impact metrics, or placeholder charts.

The UI skills informed the restrained palette, deliberate pass illustration, responsive layout, and accessible interaction states. Security-sensitive copy and documentation use full sentences to avoid ambiguity.
