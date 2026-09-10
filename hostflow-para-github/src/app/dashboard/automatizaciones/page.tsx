import { db } from "@/lib/db";
import { ensureDefaultAutomations } from "@/lib/automation";
import { Sidebar } from "../sidebar";
import { AutomationManager, type AutomationWorkflowSeed } from "./automation-manager";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  await ensureDefaultAutomations();
  const [workflows, reservations] = await Promise.all([
    db.automationWorkflow.findMany({ include: { actions: { orderBy: { position: "asc" } }, runs: { orderBy: { createdAt: "desc" }, take: 8, include: { reservation: { include: { guest: true } } } } }, orderBy: { updatedAt: "desc" } }),
    db.reservation.findMany({ include: { guest: true, property: true }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  const seeds: AutomationWorkflowSeed[] = workflows.map((workflow) => ({
    id: workflow.id, name: workflow.name, description: workflow.description, trigger: workflow.trigger, isPublished: workflow.isPublished,
    updatedAt: workflow.updatedAt.toISOString(),
    actions: workflow.actions.map((action) => ({ id: action.id, type: action.type, targetStage: action.targetStage, targetStatus: action.targetStatus, message: action.message })),
    runs: workflow.runs.map((run) => ({ id: run.id, summary: run.summary, createdAt: run.createdAt.toISOString(), guestName: run.reservation.guest.name })),
  }));
  return <div className="flex h-screen overflow-hidden bg-[#f6f7f9]"><Sidebar active="/dashboard/automatizaciones" /><AutomationManager workflows={seeds} reservations={reservations.map((reservation) => ({ id: reservation.id, label: `${reservation.guest.name} · ${reservation.property.name}` }))} /></div>;
}
