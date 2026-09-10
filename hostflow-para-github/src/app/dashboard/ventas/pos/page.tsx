import { db } from "@/lib/db";
import { Sidebar } from "../../sidebar";
import { CommercialHeader } from "../commercial-header";
import { PosTerminal } from "./pos-terminal";

export const dynamic = "force-dynamic";
export default async function PosPage() {
  const items = await db.catalogItem.findMany({ where: { isActive: true }, include: { businessUnit: true }, orderBy: { name: "asc" } });
  return <div className="flex h-screen overflow-hidden bg-[#f6f7f9]"><Sidebar active="/dashboard/ventas/pos" /><main className="min-w-0 flex-1 overflow-y-auto"><CommercialHeader active="/dashboard/ventas/pos" title="Punto de venta" subtitle="Registra consumos de restaurante, spa y recepción en el momento." /><PosTerminal items={items.map((item) => ({ id: item.id, name: item.name, price: item.price, unit: item.unit, businessUnit: item.businessUnit.name, color: item.businessUnit.color }))} /></main></div>;
}
