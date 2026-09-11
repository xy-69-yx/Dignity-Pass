# Dignity Pass contract

`dignity_pass.compact` is a privacy-preserving, one-time aid coupon contract for Midnight Network.

## Shared Preprod deployment

`5570671a6de0afd29a9252b15ade1645000e220d12fb9c74dfa0c46f9a3d7480`

Already deployed. Use `connectDignityPass()` in `lib/dignity-pass.ts` to connect; all returned `callTx` operations target this address. Runtime configuration lives in `lib/config.ts`. Do not redeploy during normal use.

## Privacy model

- Agency issues `persistentCommit(couponSecret, couponNonce, campaignId)`.
- Agency stores only commitment, never beneficiary identity or eligibility data on chain.
- Beneficiary wallet keeps `couponSecret` and `couponNonce` as private witness values.
- `redeem()` proves commitment membership, then stores only a campaign-scoped nullifier.
- Shops/agencies can verify success from transaction result or query `isRedeemed(nullifier)`; they do not receive name, address, income, refugee status, or aid history.

Nullifier is public by design: it prevents replay. It is domain-separated by `campaignId`, so the same beneficiary cannot be linked across campaigns from this contract's nullifiers.

## Operations

1. Connect to the shared address. Agency operations require the original secret matching its sealed `agencyKey`; connecting a wallet does not grant agency authority.
2. Agency generates random 32-byte `couponSecret` and `couponNonce` per beneficiary. Compute commitment and call `issueCoupon(commitment)`.
3. Give beneficiary only private coupon material. Never place secret, nonce, name, or eligibility evidence in public transaction arguments.
4. Shop calls `redeem()` through beneficiary wallet. Proof succeeds only for issued, unexpired, unredeemed coupon.
5. Repeat redemption fails with `Coupon already redeemed`.
6. Agency may `pause`, `resume`, `revokeCoupon`, or permanently `closeCampaign`.

## Important implementation note

`witness` functions must be implemented by the TypeScript DApp/wallet. Keep agency and coupon secrets in wallet-protected storage. Use a cryptographically secure random source; never reuse nonce values.

Revocation uses a separate public set keyed by commitment; it never needs to reverse the commitment into private coupon material. Do not treat this demo as audited aid infrastructure.

## Compile

Install/select Compact compiler 0.31.1, then run from project root:

```bash
compact compile +0.31.1 contracts/dignity_pass.compact
```

Compiler/runtime versions must stay aligned with deployed network tooling.
