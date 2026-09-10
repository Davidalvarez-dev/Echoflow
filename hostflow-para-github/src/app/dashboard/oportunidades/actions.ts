"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { runAutomations } from "@/lib/automation";
import { isOpportunityStatus, isPipelineStage, type OpportunityStatus, type PipelineStage } from "@/lib/pipeline";

export async function updateReservationStage(reservationId: string, nextStage: PipelineStage) {
  if (!reservationId || !isPipelineStage(nextStage)) {
    throw new Error("Etapa de reservación inválida");
  }

  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
    select: { id: true },
  });
  if (!reservation) throw new Error("La reservación ya no existe");

  await db.reservation.update({
    where: { id: reservationId },
    data: { stage: nextStage },
  });
  await runAutomations("OPPORTUNITY_STAGE_CHANGED", reservationId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/oportunidades");
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard/calendario");

  return { id: reservationId, stage: nextStage };
}

export async function recordReservationPayment(reservationId: string, amount: number, status: "Paid" | "Pending" | "Refunded") {
  if (!reservationId || !Number.isFinite(amount) || amount <= 0) throw new Error("Pago inválido");
  const reservation = await db.reservation.findUnique({ where: { id: reservationId }, select: { paidAmount: true } });
  if (!reservation) throw new Error("La reservación ya no existe");
  const nextAmount = status === "Paid" ? reservation.paidAmount + amount : status === "Refunded" ? Math.max(0, reservation.paidAmount - amount) : reservation.paidAmount;
  await db.reservation.update({ where: { id: reservationId }, data: { paidAmount: nextAmount } });
  if (status === "Paid") await runAutomations("PAYMENT_RECEIVED", reservationId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/oportunidades");
  revalidatePath("/dashboard/inbox");
  return { paidAmount: nextAmount };
}

export async function sendOpportunityQuote(reservationId: string) {
  const quote = await db.quote.findFirst({ where: { reservationId }, orderBy: { createdAt: "desc" } });
  if (!quote) throw new Error("Agrega al menos un concepto antes de enviar la cotización");
  await db.quote.update({ where: { id: quote.id }, data: { status: "SENT" } });
  await runAutomations("QUOTE_SENT", reservationId);
  revalidatePath("/dashboard/oportunidades");
  revalidatePath("/dashboard/inbox");
  return { quoteStatus: "SENT" as const };
}

export async function updateOpportunityStatus(reservationId: string, nextStatus: OpportunityStatus, lostReason?: string) {
  if (!reservationId || !isOpportunityStatus(nextStatus)) throw new Error("Estado de oportunidad inválido");
  const reason = String(lostReason ?? "").trim();
  if (nextStatus === "LOST" && !reason) throw new Error("Indica el motivo por el que se perdió la oportunidad");

  await db.reservation.update({
    where: { id: reservationId },
    data: {
      opportunityStatus: nextStatus,
      lostReason: nextStatus === "LOST" ? reason : null,
      statusChangedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/oportunidades");
  revalidatePath("/dashboard/inbox");
  return { id: reservationId, status: nextStatus, lostReason: nextStatus === "LOST" ? reason : null };
}
