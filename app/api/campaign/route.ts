import { ContractState } from "@midnight-ntwrk/compact-runtime";
import { ledger } from "@/contracts/managed/dignity-pass/contract/index";
import { DIGNITY_PASS_CONTRACT_ADDRESS, PREPROD_INDEXER } from "@/lib/config";
import type { CampaignSnapshot } from "@/lib/campaign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const response = await fetch(PREPROD_INDEXER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        query:
          "query($address: HexEncoded!) { contractAction(address: $address) { state } }",
        variables: { address: DIGNITY_PASS_CONTRACT_ADDRESS },
      }),
    });
    if (!response.ok)
      throw new Error(`Midnight indexer returned HTTP ${response.status}.`);
    const body = await response.json();
    if (body.errors?.length)
      throw new Error("Midnight indexer could not read the campaign.");
    const encoded = body.data?.contractAction?.state;
    if (
      typeof encoded !== "string" ||
      !encoded.length ||
      !/^(?:[0-9a-fA-F]{2})+$/.test(encoded)
    )
      throw new Error("Contract state unavailable from Midnight Preprod.");
    const state = ledger(
      ContractState.deserialize(Buffer.from(encoded, "hex")).data,
    );
    const hex = (value: Uint8Array) => Buffer.from(value).toString("hex");
    const agencyKey = hex(state.agencyKey);
    const snapshot: CampaignSnapshot = {
      address: DIGNITY_PASS_CONTRACT_ADDRESS,
      network: "preprod",
      state: (["OPEN", "PAUSED", "CLOSED"] as const)[state.state],
      campaignId: hex(state.campaignId),
      agencyKey,
      placeholderAgency: agencyKey === "22".repeat(32),
      expiresAt: String(state.expiresAt),
      maxCoupons: String(state.maxCoupons),
      issuedCount: String(state.issuedCount),
      commitments: Array.from(state.issuedCoupons, hex),
      revoked: Array.from(state.revokedCoupons, hex),
      nullifiers: Array.from(state.redeemedNullifiers, hex),
      fetchedAt: new Date().toISOString(),
    };
    return Response.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Campaign could not be loaded.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
