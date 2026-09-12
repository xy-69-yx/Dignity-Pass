# Fresh Preprod deployment

Fresh credentials are stored locally in `private/deployment-credentials.json`. The directory is ignored by Git. Never paste `agencySecret` into chat, GitHub, screenshots, browser URLs, or public documentation.

## Deployment values

Use these public constructor values:

```text
network:      preprod
agencyKeyHash: c2f67cb115d5d619a030be8ecd35c9fe6896d3e5d03e92eab7eeb1c100d83df8
campaignId:   20b1bb9bd013ee057567509e655214dd8bfd41a7218cba035ef9c6600d900d4f
expiry:       0
maxCoupons:   500
```

Private agency secret lives only in `private/deployment-credentials.json`.

## Safe deployment sequence

1. Open the repository locally.
2. Open `private/deployment-credentials.json`.
3. Copy `agencyKeyHash`, `campaignId`, `expiry`, and `maxCoupons` into the Compact deployment flow.
4. Use the private `agencySecret` only as the agency witness/private state.
5. Deploy to Midnight `preprod` through 1AM.
6. Wait until the returned address is indexed.
7. Verify constructor state: campaign ID, agency key hash, open state, zero expiry, and limit 500.
8. Send only the new public contract address here.

Do not send the agency secret. After address verification, application config and all docs will be updated to the new address.

## Verification before handoff

Run a read-only check against the new address and confirm:

- `state = OPEN`
- `agencyKey = c2f67cb115d5d619a030be8ecd35c9fe6896d3e5d03e92eab7eeb1c100d83df8`
- `campaignId = 20b1bb9bd013ee057567509e655214dd8bfd41a7218cba035ef9c6600d900d4f`
- `expiresAt = 0`
- `maxCoupons = 500`
- `issuedCount = 0`

The new address is now configured in `lib/config.ts` and verified against Preprod. Run the app and complete a wallet-approved issue/redeem acceptance run before recording the demo.
