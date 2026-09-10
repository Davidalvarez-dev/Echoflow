export const PIPELINE_STAGES = [
  "INQUIRY",
  "CONVERSATION",
  "QUOTED",
  "BOOKED",
  "STAYING",
] as const;

export const OPPORTUNITY_STATUSES = ["OPEN", "WON", "LOST", "ABANDONED"] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];
export type PipelineLanguage = "es" | "en";

export const STAGE_ORDER: Record<PipelineStage, number> = {
  INQUIRY: 0,
  CONVERSATION: 1,
  QUOTED: 2,
  BOOKED: 3,
  STAYING: 4,
};

export const STAGE_LABELS: Record<PipelineLanguage, Record<PipelineStage, string>> = {
  es: {
    INQUIRY: "Nueva consulta",
    CONVERSATION: "En conversación",
    QUOTED: "Cotización enviada",
    BOOKED: "Reservada",
    STAYING: "Hospedado ahora",
  },
  en: {
    INQUIRY: "New inquiry",
    CONVERSATION: "In conversation",
    QUOTED: "Quote sent",
    BOOKED: "Booked",
    STAYING: "Staying now",
  },
};

export const STAGE_COLORS: Record<PipelineStage, string> = {
  INQUIRY: "#f2c94c",
  CONVERSATION: "#e8874e",
  QUOTED: "#9a78de",
  BOOKED: "#54b7d3",
  STAYING: "#2563eb",
};

type ReservationForStage = {
  stage?: string | null;
  opportunityStatus?: string | null;
  status: string;
  hasQuote: boolean;
  paidAmount: number;
  checkIn: Date | string;
  checkOut: Date | string;
};

export function isPipelineStage(value: string): value is PipelineStage {
  return PIPELINE_STAGES.includes(value as PipelineStage);
}

export function stageLabel(stage: PipelineStage, language: PipelineLanguage = "es") {
  return STAGE_LABELS[language][stage];
}

export function stageOf(reservation: ReservationForStage, now = new Date()): PipelineStage {
  const checkIn = new Date(reservation.checkIn);
  const checkOut = new Date(reservation.checkOut);
  if (checkIn <= now && now < checkOut) return "STAYING";
  if (reservation.stage && isPipelineStage(reservation.stage)) return reservation.stage;
  if (reservation.paidAmount > 0 || reservation.status === "CONFIRMED" || checkOut < now) return "BOOKED";
  if (reservation.hasQuote) return "QUOTED";
  return "INQUIRY";
}

export function reachedStage(current: PipelineStage, target: PipelineStage) {
  return STAGE_ORDER[current] >= STAGE_ORDER[target];
}

export function isOpportunityStatus(value: string): value is OpportunityStatus {
  return OPPORTUNITY_STATUSES.includes(value as OpportunityStatus);
}
