import Link from "next/link";
import { db } from "@/lib/db";
import { Sidebar } from "../../sidebar";
import { CommercialHeader } from "../commercial-header";

export const dynamic = "force-dynamic";

const statusLabels = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  ACCEPTED: "Aceptada",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
} as const;

const statusStyles = {
  DRAFT: "bg-ink/5 text-ink/55",
  SENT: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  EXPIRED: "bg-amber-50 text-amber-800",
  CANCELLED: "bg-red-50 text-red-700",
} as const;

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function QuotesPage() {
  const quotes = await db.quote.findMany({
    include: {
      guest: true,
      reservation: { include: { property: true } },
      sale: true,
      _count: { select: { lines: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const rows = quotes.map((quote) => {
    const paid = Math.min(quote.total, Math.max(quote.sale?.paidAmount ?? 0, quote.reservation?.paidAmount ?? 0));
    const pending = ["CANCELLED", "EXPIRED"].includes(quote.status) ? 0 : Math.max(0, quote.total - paid);
    return { ...quote, paid, pending };
  });
  const openQuotes = rows.filter((quote) => ["DRAFT", "SENT"].includes(quote.status)).length;
  const accepted = rows.filter((quote) => quote.status === "ACCEPTED").length;
  const totalPending = rows.reduce((sum, quote) => sum + quote.pending, 0);
  const totalPaid = rows.reduce((sum, quote) => sum + quote.paid, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f9]">
      <Sidebar active="/dashboard/ventas/cotizaciones" />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <CommercialHeader
          active="/dashboard/ventas/cotizaciones"
          title="Seguimiento de cotizaciones"
          subtitle="Consulta propuestas y saldos; edita cada cotización dentro de su oportunidad."
        />
        <div className="mx-auto max-w-[1500px] p-8">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="En seguimiento" value={String(openQuotes)} detail="Borradores y enviadas" />
            <Metric label="Aceptadas" value={String(accepted)} detail="Propuestas confirmadas" />
            <Metric label="Pendiente de cobro" value={money(totalPending)} detail="Saldo activo" />
            <Metric label="Cobrado" value={money(totalPaid)} detail="Aplicado a cotizaciones" />
          </section>

          <section className="mt-6 overflow-hidden rounded-md border border-ink/10 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
              <div><h2 className="font-bold">Historial de propuestas</h2><p className="mt-1 text-xs text-ink/45">Últimas {rows.length} cotizaciones actualizadas</p></div>
              <p className="max-w-lg text-right text-xs leading-5 text-ink/45">La edición de conceptos ocurre dentro de la oportunidad para mantener conversación, reserva y cobro en el mismo contexto.</p>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-ink/[0.025] text-xs uppercase text-ink/45">
                  <tr><th className="px-5 py-3">Cotización</th><th className="px-4 py-3">Oportunidad</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Cobrado</th><th className="px-4 py-3 text-right">Pendiente</th><th className="px-5 py-3" /></tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {rows.map((quote) => (
                    <tr key={quote.id}>
                      <td className="px-5 py-4"><strong>{quote.number}</strong><p className="mt-1 text-xs text-ink/40">{quote._count.lines} conceptos · {quote.updatedAt.toLocaleDateString("es-MX")}</p></td>
                      <td className="px-4 py-4"><strong>{quote.guest.name}</strong><p className="mt-1 text-xs text-ink/40">{quote.reservation?.property.name ?? "Sin reserva vinculada"}</p></td>
                      <td className="px-4 py-4"><span className={`rounded px-2 py-1 text-xs font-bold ${statusStyles[quote.status]}`}>{statusLabels[quote.status]}</span></td>
                      <td className="px-4 py-4 text-right font-bold">{money(quote.total)}</td>
                      <td className="px-4 py-4 text-right text-emerald-700">{money(quote.paid)}</td>
                      <td className="px-4 py-4 text-right font-bold">{money(quote.pending)}</td>
                      <td className="px-5 py-4 text-right">
                        {quote.reservationId ? <Link href={`/dashboard/inbox?reservation=${quote.reservationId}`} className="inline-flex h-9 items-center rounded-md border border-ink/15 px-3 text-xs font-bold hover:bg-ink/5">Abrir oportunidad</Link> : <span className="text-xs text-ink/35">Sin oportunidad</span>}
                      </td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan={7} className="px-5 py-14 text-center text-ink/40">Las cotizaciones creadas desde una oportunidad aparecerán aquí.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="rounded-md border border-ink/10 bg-white p-5"><p className="text-xs font-bold uppercase text-ink/40">{label}</p><strong className="mt-2 block text-2xl">{value}</strong><p className="mt-1 text-xs text-ink/40">{detail}</p></article>;
}
