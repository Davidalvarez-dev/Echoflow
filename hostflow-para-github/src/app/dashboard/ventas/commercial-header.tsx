import Link from "next/link";

const tabs = [
  ["Oportunidades", "/dashboard/oportunidades"],
  ["Seguimiento", "/dashboard/ventas/cotizaciones"],
  ["Ventas y órdenes", "/dashboard/ventas/ordenes"],
  ["Catálogo", "/dashboard/ventas/catalogo"],
  ["Punto de venta", "/dashboard/ventas/pos"],
] as const;

export function CommercialHeader({ active, title, subtitle }: { active: string; title: string; subtitle: string }) {
  return (
    <>
      <header className="border-b border-ink/10 bg-white px-8 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-xs font-bold uppercase text-ink/35">Ventas</p><h1 className="mt-1 font-display text-3xl font-extrabold text-ink">{title}</h1><p className="mt-1 text-sm text-ink/45">{subtitle}</p></div>
        </div>
        <nav className="mt-6 flex gap-6 overflow-x-auto" aria-label="Módulos de ventas">
          {tabs.map(([label, href]) => <Link key={href} href={href} className={`whitespace-nowrap border-b-2 pb-3 text-sm font-bold ${active === href ? "border-ink text-ink" : "border-transparent text-ink/45 hover:text-ink"}`}>{label}</Link>)}
        </nav>
      </header>
    </>
  );
}
