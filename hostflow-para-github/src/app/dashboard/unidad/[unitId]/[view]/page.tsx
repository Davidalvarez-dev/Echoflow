import { db } from "@/lib/db";
import { Sidebar } from "../../../sidebar";
import { ComingSoon } from "../../../coming-soon";

export const dynamic = "force-dynamic";

const VIEW_COPY: Record<string, { es: string; en: string; descEs: string; descEn: string }> = {
  hoy: {
    es: "Hoy",
    en: "Today",
    descEs: "Lo que pasa hoy en esta unidad: producción, servicios vendidos y pendientes.",
    descEn: "What's happening today in this unit: production, sold services and pending items.",
  },
  checklists: {
    es: "Checklists",
    en: "Checklists",
    descEs: "Apertura, cierre y preparaciones de esta unidad. El staff los ejecuta desde MI DÍA.",
    descEn: "Opening, closing and prep for this unit. Staff executes them from MY DAY.",
  },
  ordenes: {
    es: "Órdenes",
    en: "Orders",
    descEs: "Lo vendido de esta unidad: al folio del huésped o por punto de venta.",
    descEn: "Everything sold by this unit: to the guest folio or via point of sale.",
  },
};

export default async function UnitViewPage({
  params,
}: {
  params: Promise<{ unitId: string; view: string }>;
}) {
  const { unitId, view } = await params;
  const unit = await db.businessUnit.findUnique({ where: { id: unitId }, select: { name: true } });
  const copy = VIEW_COPY[view] ?? VIEW_COPY.hoy;
  const unitName = unit?.name ?? "Unidad";

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active={`/dashboard/unidad/${unitId}/${view}`} />
      <ComingSoon
        title={{ es: `${unitName} — ${copy.es}`, en: `${unitName} — ${copy.en}` }}
        description={{ es: copy.descEs, en: copy.descEn }}
      />
    </div>
  );
}
