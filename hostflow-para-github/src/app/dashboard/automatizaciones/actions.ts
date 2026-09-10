"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ensureDefaultAutomations, runAutomations } from "@/lib/automation";
import { isAutomationAction, isAutomationTrigger } from "@/lib/automation-types";
import { isOpportunityStatus, isPipelineStage } from "@/lib/pipeline";

function refresh() { revalidatePath("/dashboard/automatizaciones"); }

export async function createWorkflow(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const trigger = String(formData.get("trigger") ?? "");
  if (!name || !isAutomationTrigger(trigger)) throw new Error("Nombre o disparador inválido");
  const workflow = await db.automationWorkflow.create({ data: { name, trigger, description: String(formData.get("description") ?? "").trim() || null } });
  refresh();
  return workflow.id;
}

export async function setWorkflowPublished(id: string, isPublished: boolean) {
  await db.automationWorkflow.update({ where: { id }, data: { isPublished } });
  refresh();
}

export async function updateWorkflowTrigger(id: string, trigger: string) {
  if (!isAutomationTrigger(trigger)) throw new Error("Disparador inválido");
  await db.automationWorkflow.update({ where: { id }, data: { trigger } });
  refresh();
}

export async function addWorkflowAction(id: string, type: string) {
  if (!isAutomationAction(type)) throw new Error("Acción inválida");
  const position = await db.automationAction.count({ where: { workflowId: id } });
  await db.automationAction.create({ data: { workflowId: id, position, type } });
  refresh();
}

export async function configureWorkflowAction(id: string, data: { targetStage?: string; targetStatus?: string; message?: string }) {
  const payload: { targetStage?: never; targetStatus?: never; message?: string | null } = {};
  if (data.targetStage && isPipelineStage(data.targetStage)) payload.targetStage = data.targetStage as never;
  if (data.targetStatus && isOpportunityStatus(data.targetStatus)) payload.targetStatus = data.targetStatus as never;
  if (data.message !== undefined) payload.message = data.message.trim() || null;
  await db.automationAction.update({ where: { id }, data: payload });
  refresh();
}

export async function deleteWorkflowAction(id: string) {
  await db.automationAction.delete({ where: { id } });
  refresh();
}

export async function seedAutomationTemplates() { await ensureDefaultAutomations(); refresh(); }

export async function testWorkflow(workflowId: string, reservationId: string) {
  const workflow = await db.automationWorkflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new Error("Workflow no encontrado");
  await db.automationWorkflow.update({ where: { id: workflowId }, data: { isPublished: true } });
  const executions = await runAutomations(workflow.trigger, reservationId, workflowId);
  refresh();
  return executions.length;
}
