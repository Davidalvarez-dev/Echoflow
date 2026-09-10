import { db } from "@/lib/db";
import { Sidebar } from "../../sidebar";
import { CommercialHeader } from "../commercial-header";
import { CatalogBrowser } from "./catalog-browser";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [items, units] = await Promise.all([
    db.catalogItem.findMany({
      include: {
        businessUnit: true,
        category: true,
        packageParts: { include: { item: true } },
      },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    db.businessUnit.findMany({
      include: { categories: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f9]">
      <Sidebar active="/dashboard/ventas/catalogo" />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <CommercialHeader
          active="/dashboard/ventas/catalogo"
          title="Catálogo comercial"
          subtitle="Habitaciones, productos, servicios y paquetes organizados por unidad de negocio."
        />
        <CatalogBrowser items={items} units={units} />
      </main>
    </div>
  );
}
