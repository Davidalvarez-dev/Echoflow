import { db } from "@/lib/db";
import { isOpportunityStatus, isPipelineStage, type OpportunityStatus, type PipelineStage } from "@/lib/pipeline";
import { type AutomationActionType, type AutomationTrigger } from "@/lib/automation-types";
export { isAutomationAction, isAutomationTrigger } from "@/lib/automation-types";
export type { AutomationActionType, AutomationTrigger } from "@/lib/automation-types";

export async function runAutomations(trigger: AutomationTrigger, reservationId: string, workflowId?: string) {
  const workflows = await db.automationWorkflow.findMany({
    where: { trigger, isPublished: true, ...(workflowId ? { id: workflowId } : {}) },
    include: { actions: { orderBy: { position: "asc" } } },
  });
  if (!workflows.length) return [];

  const executions: string[] = [];
  for (const workflow of workflows) {
    const changes: { stage?: PipelineStage; opportunityStatus?: OpportunityStatus; statusChangedAt?: Date } = {};
    const messages: string[] = [];
    for (const action of workflow.actions) {
      if (action.type === "MOVE_STAGE" && action.targetStage && isPipelineStage(action.targetStage)) changes.stage = action.targetStage;
      if (action.type === "SET_STATUS" && action.targetStatus && isOpportunityStatus(action.targetStatus)) {
        changes.opportunityStatus = action.targetStatus;
        changes.statusChangedAt = new Date();
      }
      if ((action.type === "SEND_MESSAGE" || action.type === "CREATE_TASK") && action.message?.trim()) messages.push(action.message.trim());
    }
    await db.$transaction(async (tx) => {
      if (Object.keys(changes).length) await tx.reservation.update({ where: { id: reservationId }, data: changes });
      if (messages.length) {
        await tx.message.createMany({ data: messages.map((body) => ({ reservationId, author: "SYSTEM", body })) });
      }
      await tx.automationRun.create({
        data: { workflowId: workflow.id, reservationId, trigger, summary: workflow.actions.length ? `${workflow.actions.length} acción(es) ejecutada(s)` : "Sin acciones configuradas" },
      });
    });
    executions.push(workflow.id);
  }
  return executions;
}

export async function ensureDefaultAutomations() {
  const templates: Array<{ name: string; description: string; trigger: AutomationTrigger; actions: Array<{ type: AutomationActionType; targetStage?: PipelineStage; targetStatus?: OpportunityStatus; message?: string }> }> = [
    { name: "Pago confirmado → Reservada", description: "Al recibir un pago por Stripe o una confirmación manual, mueve la oportunidad a Reservada.", trigger: "PAYMENT_RECEIVED", actions: [{ type: "MOVE_STAGE", targetStage: "BOOKED" }, { type: "SEND_MESSAGE", message: "Pago confirmado. La reservación pasó a Reservada." }] },
    { name: "Check-in → Hospedado y ganada", description: "Al llegar la fecha de entrada, mueve la oportunidad a Hospedado ahora y la marca como ganada.", trigger: "CHECK_IN_DATE_REACHED", actions: [{ type: "MOVE_STAGE", targetStage: "STAYING" }, { type: "SET_STATUS", targetStatus: "WON" }, { type: "CREATE_TASK", message: "Estancia iniciada: confirmar que el huésped recibió la bienvenida." }] },
    { name: "Cotización enviada", description: "Mantiene la oportunidad en Cotización enviada cuando se comparte la propuesta.", trigger: "QUOTE_SENT", actions: [{ type: "MOVE_STAGE", targetStage: "QUOTED" }] },
  ];
  for (const template of templates) {
    const current = await db.automationWorkflow.findFirst({ where: { name: template.name } });
    if (!current) {
      await db.automationWorkflow.create({
        data: { name: template.name, description: template.description, trigger: template.trigger, isPublished: true, actions: { create: template.actions.map((action, position) => ({ ...action, position })) } },
      });
    }
  }
}
