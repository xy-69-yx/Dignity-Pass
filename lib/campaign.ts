export type CampaignSnapshot = {
  address: string;
  network: "preprod";
  state: "OPEN" | "PAUSED" | "CLOSED";
  campaignId: string;
  agencyKey: string;
  placeholderAgency: boolean;
  expiresAt: string;
  maxCoupons: string;
  issuedCount: string;
  commitments: string[];
  revoked: string[];
  nullifiers: string[];
  fetchedAt: string;
};

export function campaignBlock(snapshot: CampaignSnapshot): string | null {
  if (snapshot.state !== "OPEN")
    return `Campaign is ${snapshot.state.toLowerCase()}.`;
  if (
    snapshot.expiresAt !== "0" &&
    BigInt(snapshot.expiresAt) < BigInt(Math.floor(Date.now() / 1000))
  )
    return "Campaign has expired.";
  return null;
}
