export const MARKETING_SOURCES = [
  "instagram",
  "facebook",
  "booking",
  "airbnb",
  "direct",
  "whatsapp",
  "vrbo",
  "google",
  "referral",
  "other",
] as const;

export type MarketingSource = (typeof MARKETING_SOURCES)[number];

type ReservationSource = {
  source?: string | null;
  channel?: string | null;
};

export function marketingSourceOf(reservation: ReservationSource): MarketingSource {
  const source = reservation.source?.trim().toLowerCase() ?? "";
  if (source.includes("instagram") || source === "ig") return "instagram";
  if (source.includes("facebook") || source.includes("meta")) return "facebook";
  if (source.includes("whatsapp") || source.includes("wa.me")) return "whatsapp";
  if (source.includes("google")) return "google";
  if (source.includes("refer") || source.includes("recomend")) return "referral";
  if (source.includes("booking")) return "booking";
  if (source.includes("airbnb")) return "airbnb";
  if (source.includes("vrbo")) return "vrbo";
  if (source.includes("web") || source.includes("direct")) return "direct";

  if (reservation.channel === "BOOKING") return "booking";
  if (reservation.channel === "AIRBNB") return "airbnb";
  if (reservation.channel === "VRBO") return "vrbo";
  if (reservation.channel === "DIRECT") return "direct";
  return "other";
}
