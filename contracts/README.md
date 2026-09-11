# Dignity Pass contract

`dignity_pass.compact` is a privacy-preserving, one-time aid coupon contract for Midnight Network.

## Shared Preprod deployment

`5570671a6de0afd29a9252b15ade1645000e220d12fb9c74dfa0c46f9a3d7480`

Already deployed. Use `connectDignityPass()` in `lib/dignity-pass.ts` to connect; all returned `callTx` operations target this address. Runtime configuration lives in `lib/config.ts`. Do not redeploy during normal use.

Live inspection found the sealed agency key is the placeholder `2222…2222`. Agency circuits require a matching secret and cannot be unlocked by generating an unrelated new one. There is no key-rotation circuit. Public reads work; successful agency transactions require resolving this deployment configuration.

## Privacy model

- Agency issues `persistentCommit(couponSecret, couponNonce, campaignId)`.
- Agency stores only commitment, never beneficiary identity or eligibility data on chain.
- The recipient imports the private pass file locally. Its secret and nonce become in-memory witness values for wallet proving.
- `redeem()` proves commitment membership, then stores only a campaign-scoped nullifier.
- Shops/agencies can verify success from transaction result or query `isRedeemed(nullifier)`; they do not receive name, address, income, refugee status, or aid history.

Nullifier is public by design: it prevents replay and is domain-separated by `campaignId`. This does not prevent correlation through transaction metadata or parties who already know the private pass credentials.

## Operations

1. Connect to the shared address. Agency operations require the original secret matching its sealed `agencyKey`; connecting a wallet does not grant agency authority.
2. Agency generates random 32-byte `couponSecret` and `couponNonce` per beneficiary. Compute commitment and call `issueCoupon(commitment)`.
3. Give beneficiary only private coupon material. Never place secret, nonce, name, or eligibility evidence in public transaction arguments.
4. Shop calls `redeem()` through beneficiary wallet. Proof succeeds only for issued, unexpired, unredeemed coupon.
5. Repeat redemption fails with `Coupon already redeemed`.
6. Agency may `pause`, `resume`, `revokeCoupon`, or permanently `closeCampaign`.

## Important implementation note

Witness functions are implemented in `lib/dignity-pass.ts`. `lib/coupon.ts` uses secure browser randomness and Compact runtime hash/commit descriptors. Secret bytes are held in browser memory during operations and cleared when the call settles. Users explicitly download private pass or agency credential files; encrypted automatic backup is not implemented.

Revocation uses a separate public set keyed by commitment; it never needs to reverse the commitment into private coupon material. Do not treat this demo as audited aid infrastructure.

## Compile

Install/select Compact compiler 0.31.1, then run from project root:

```bash
compact compile +0.31.1 contracts/dignity_pass.compact /tmp/dignity-pass-compiled
```

Compiler/runtime versions must stay aligned with deployed network tooling.
