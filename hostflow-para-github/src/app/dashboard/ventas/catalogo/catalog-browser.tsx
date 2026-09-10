"use client";

import { useMemo, useState } from "react";
import { addPackageComponent, createCatalogItem, toggleCatalogItem } from "../actions";

type ItemType = "ROOM" | "PRODUCT" | "SERVICE" | "PACKAGE";

type CatalogItem = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  type: ItemType;
  unit: string;
  price: number;
  cost: number;
  taxRate: number;
  isActive: boolean;
  businessUnit: { id: string; name: string; color: string };
  category: { id: string; name: string } | null;
  packageParts: { quantity: number; item: { id: string; name: string } }[];
};

type BusinessUnit = {
  id: string;
  name: string;
  color: string;
  categories: { id: string; name: string }[];
};

const typeLabels: Record<ItemType, string> = {
  ROOM: "Habitación",
  PRODUCT: "Producto",
  SERVICE: "Servicio",
  PACKAGE: "Paquete",
};

const PAGE_SIZE = 12;

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CatalogBrowser({ items, units }: { items: CatalogItem[]; units: BusinessUnit[] }) {
  const [query, setQuery] = useState("");
  const [unitId, setUnitId] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"item" | "package">("item");

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("es");
    return items.filter((item) => {
      const matchesUnit = unitId === "all" || item.businessUnit.id === unitId;
      const haystack = `${item.name} ${item.sku ?? ""} ${item.category?.name ?? ""}`.toLocaleLowerCase("es");
      return matchesUnit && (!term || haystack.includes(term));
    });
  }, [items, query, unitId]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function openModal(mode: "item" | "package") {
    setModalMode(mode);
    setModalOpen(true);
  }

  return (
    <div className="mx-auto max-w-[1500px] p-8">
      <section className="border-b border-ink/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Productos y servicios</h2>
            <p className="mt-1 text-sm text-ink/45">{items.filter((item) => item.isActive).length} activos de {items.length}</p>
          </div>
          <div className="flex items-center gap-2">
            {items.some((item) => item.type === "PACKAGE") && (
              <button type="button" onClick={() => openModal("package")} className="h-11 rounded-md border border-ink/15 bg-white px-4 text-sm font-bold hover:bg-ink/[0.03]">
                Componer paquete
              </button>
            )}
            <button type="button" onClick={() => openModal("item")} className="h-11 rounded-md bg-ink px-5 text-sm font-bold text-white hover:bg-ink/85">
              + Nuevo elemento
            </button>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por unidad de negocio">
          <button type="button" onClick={() => { setUnitId("all"); setPage(1); }} className={`h-10 shrink-0 rounded-md border px-4 text-sm font-bold ${unitId === "all" ? "border-ink bg-ink text-white" : "border-ink/15 bg-white"}`}>
            Todas <span className="ml-1 opacity-60">{items.length}</span>
          </button>
          {units.map((unit) => {
            const count = items.filter((item) => item.businessUnit.id === unit.id).length;
            return (
              <button key={unit.id} type="button" onClick={() => { setUnitId(unit.id); setPage(1); }} className={`flex h-10 shrink-0 items-center gap-2 rounded-md border px-4 text-sm font-bold ${unitId === unit.id ? "border-ink bg-white text-ink shadow-sm" : "border-ink/10 bg-transparent text-ink/55"}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: unit.color }} />
                {unit.name} <span className="text-ink/35">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <label className="relative block w-full max-w-md">
          <span className="sr-only">Buscar en el catálogo</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por nombre, SKU o categoría" className="h-11 w-full rounded-md border border-ink/15 bg-white px-4 pr-10 text-sm outline-none focus:border-ink" />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40">⌕</span>
        </label>
        <p className="text-sm text-ink/45">Mostrando {visible.length} de {filtered.length}</p>
      </div>

      {visible.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((item) => (
            <article key={item.id} className={`flex min-h-52 flex-col rounded-md border border-ink/10 bg-white p-5 ${item.isActive ? "" : "opacity-55"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.businessUnit.color }} />
                    <span className="text-xs font-bold text-ink/45">{item.businessUnit.name}</span>
                    <span className="rounded bg-ink/5 px-2 py-1 text-[11px] font-bold">{typeLabels[item.type]}</span>
                  </div>
                  <h3 className="mt-3 truncate text-base font-bold">{item.name}</h3>
                  <p className="mt-1 text-xs text-ink/40">{item.sku ?? "Sin SKU"} · {item.category?.name ?? "Sin categoría"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <strong>{money(item.price)}</strong>
                  <p className="text-xs text-ink/40">/{item.unit}</p>
                </div>
              </div>
              <div className="mt-4 min-h-10 flex-1 text-xs leading-5 text-ink/50">
                {item.type === "PACKAGE" ? (
                  <p><strong className="text-[#2468ec]">Incluye:</strong> {item.packageParts.length ? item.packageParts.map((part) => `${part.quantity}× ${part.item.name}`).join(", ") : "sin componentes"}</p>
                ) : (
                  <p className="line-clamp-2">{item.description || "Sin descripción comercial."}</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
                <span className={`rounded px-2 py-1 text-xs font-bold ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink/5 text-ink/45"}`}>{item.isActive ? "Activo" : "Inactivo"}</span>
                <form action={toggleCatalogItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="rounded-md border border-ink/15 px-3 py-2 text-xs font-bold hover:bg-ink/5">{item.isActive ? "Desactivar" : "Activar"}</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid min-h-72 place-items-center rounded-md border border-dashed border-ink/15 bg-white text-center">
          <div><strong>No encontramos elementos</strong><p className="mt-1 text-sm text-ink/45">Cambia la unidad o el término de búsqueda.</p></div>
        </div>
      )}

      {pageCount > 1 && (
        <nav className="mt-6 flex items-center justify-end gap-2" aria-label="Paginación del catálogo">
          <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => current - 1)} className="h-10 rounded-md border border-ink/15 bg-white px-4 text-sm font-bold disabled:opacity-35">Anterior</button>
          <span className="px-3 text-sm text-ink/50">Página {safePage} de {pageCount}</span>
          <button type="button" disabled={safePage === pageCount} onClick={() => setPage((current) => current + 1)} className="h-10 rounded-md border border-ink/15 bg-white px-4 text-sm font-bold disabled:opacity-35">Siguiente</button>
        </nav>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white shadow-2xl">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink/10 bg-white px-6 py-5">
              <div><h2 id="catalog-modal-title" className="font-display text-2xl font-extrabold">{modalMode === "item" ? "Nuevo elemento" : "Componer paquete"}</h2><p className="mt-1 text-sm text-ink/45">{modalMode === "item" ? "Disponible para oportunidades, reservas y punto de venta." : "Define los productos y servicios incluidos en un paquete."}</p></div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Cerrar" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-ink/15 text-xl hover:bg-ink/5">×</button>
            </header>

            {modalMode === "item" ? (
              <form action={async (formData) => { await createCatalogItem(formData); setModalOpen(false); }} className="grid gap-4 p-6 md:grid-cols-2">
                <label className="block text-xs font-bold md:col-span-2">Nombre<input required name="name" className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" /></label>
                <label className="text-xs font-bold">Tipo<select name="type" className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option value="PRODUCT">Producto</option><option value="SERVICE">Servicio</option><option value="PACKAGE">Paquete</option><option value="ROOM">Habitación</option></select></label>
                <label className="text-xs font-bold">Unidad<input name="unit" defaultValue="unidad" className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" /></label>
                <label className="block text-xs font-bold">Unidad de negocio<select required name="businessUnitId" className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option value="">Seleccionar</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
                <label className="block text-xs font-bold">Categoría<select name="categoryId" className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option value="">Sin categoría</option>{units.flatMap((unit) => unit.categories.map((category) => <option key={category.id} value={category.id}>{unit.name} · {category.name}</option>))}</select></label>
                <label className="text-xs font-bold">Precio<input required min="0" step="0.01" type="number" name="price" className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" /></label>
                <label className="text-xs font-bold">Costo<input min="0" step="0.01" type="number" name="cost" className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" /></label>
                <label className="text-xs font-bold">Impuesto %<input min="0" max="100" step="0.01" type="number" name="taxRate" defaultValue="16" className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" /></label>
                <label className="text-xs font-bold">SKU<input name="sku" className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" /></label>
                <label className="block text-xs font-bold md:col-span-2">Descripción<textarea name="description" rows={3} className="mt-2 w-full rounded-md border border-ink/15 p-3 text-sm" /></label>
                <div className="flex justify-end gap-2 border-t border-ink/10 pt-5 md:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="h-11 rounded-md border border-ink/15 px-5 text-sm font-bold">Cancelar</button><button className="h-11 rounded-md bg-ink px-5 text-sm font-bold text-white">Agregar al catálogo</button></div>
              </form>
            ) : (
              <form action={async (formData) => { await addPackageComponent(formData); setModalOpen(false); }} className="space-y-4 p-6">
                <label className="block text-xs font-bold">Paquete<select required name="packageId" className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option value="">Seleccionar paquete</option>{items.filter((item) => item.type === "PACKAGE").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="block text-xs font-bold">Producto o servicio incluido<select required name="itemId" className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option value="">Seleccionar elemento</option>{items.filter((item) => item.type !== "PACKAGE" && item.isActive).map((item) => <option key={item.id} value={item.id}>{item.businessUnit.name} · {item.name}</option>)}</select></label>
                <label className="block text-xs font-bold">Cantidad<input name="quantity" type="number" min="0.01" step="0.01" defaultValue="1" className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" /></label>
                <div className="flex justify-end gap-2 border-t border-ink/10 pt-5"><button type="button" onClick={() => setModalOpen(false)} className="h-11 rounded-md border border-ink/15 px-5 text-sm font-bold">Cancelar</button><button className="h-11 rounded-md bg-ink px-5 text-sm font-bold text-white">Agregar componente</button></div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
