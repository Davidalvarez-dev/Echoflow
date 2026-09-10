"use client";

import { useMemo } from "react";
import { useLanguage } from "../language-provider";
import { useRole } from "../role-provider";
import { type AnalyticsReservation, type CommercialLine } from "./analytics-dashboard";
import { OwnerDashboard } from "./owner-dashboard";

export type DashboardBusinessUnit = {
  id: string;
  name: string;
  type: string;
  color: string;
};

type Props = {
  reservations: AnalyticsReservation[];
  commercialLines: CommercialLine[];
  propertyCount: number;
  averageNightlyRate: number;
  businessUnits: DashboardBusinessUnit[];
};

type Action = { label: string; href: string; tone?: "dark" | "light" };

function money(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);
}

function isSameDay(value: string, date: Date) {
  const item = new Date(value);
  return item.getFullYear() === date.getFullYear() && item.getMonth() === date.getMonth() && item.getDate() === date.getDate();
}

function dayName(language: "es" | "en") {
  return new Date().toLocaleDateString(language === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function Shell({ title, subtitle, children, actions = [] }: { title: string; subtitle: string; children: React.ReactNode; actions?: Action[] }) {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#f6f7f9]">
      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-5">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
            <p className="mt-1 text-sm text-ink/50">{subtitle}</p>
          </div>
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <a key={action.href} href={action.href} className={`rounded-md px-4 py-2.5 text-sm font-bold transition ${action.tone === "dark" ? "bg-ink text-white hover:bg-black" : "border border-ink/15 bg-white text-ink hover:border-ink/35"}`}>
                  {action.label}
                </a>
              ))}
            </div>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <section className="border border-ink/10 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-ink/45">{label}</p><strong className="mt-2 block font-display text-3xl font-extrabold text-ink">{value}</strong>{detail && <p className="mt-1 text-xs text-ink/45">{detail}</p>}</section>;
}

function List({ title, empty, children }: { title: string; empty?: boolean; children: React.ReactNode }) {
  return <section className="overflow-hidden border border-ink/10 bg-white"><h2 className="border-b border-ink/10 px-5 py-4 text-sm font-bold text-ink">{title}</h2>{empty ? <p className="px-5 py-8 text-center text-sm text-ink/40">Sin pendientes por ahora.</p> : <div className="divide-y divide-ink/10">{children}</div>}</section>;
}

function Row({ title, detail, value, href }: { title: string; detail: string; value?: string; href?: string }) {
  const content = <><div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{title}</p><p className="mt-1 truncate text-xs text-ink/50">{detail}</p></div>{value && <strong className="shrink-0 text-sm text-ink">{value}</strong>}</>;
  const className = "flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-ink/[0.025]";
  return href ? <a href={href} className={className}>{content}</a> : <div className={className}>{content}</div>;
}

function ManagerDashboard({ reservations }: Pick<Props, "reservations">) {
  const { language } = useLanguage();
  const today = useMemo(() => new Date(), []);
  const arrivals = reservations.filter((item) => isSameDay(item.checkIn, today));
  const departures = reservations.filter((item) => isSameDay(item.checkOut, today));
  const pending = reservations.filter((item) => item.opportunityStatus === "OPEN" && item.totalAmount > item.paidAmount);
  const inHouse = reservations.filter((item) => new Date(item.checkIn) < today && new Date(item.checkOut) >= today);
  return <Shell title={language === "es" ? "Operación general" : "Operations overview"} subtitle={`${dayName(language)} · Prioridades del negocio`} actions={[{ label: language === "es" ? "Ver operación de hoy" : "Open today", href: "/dashboard/hoy", tone: "dark" }, { label: language === "es" ? "Ver calendario" : "Open calendar", href: "/dashboard/calendario" }]}>
    <div className="mt-6 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 xl:grid-cols-4"><Metric label={language === "es" ? "Llegadas" : "Arrivals"} value={arrivals.length} detail={language === "es" ? "para recibir hoy" : "to welcome today"}/><Metric label={language === "es" ? "Salidas" : "Departures"} value={departures.length} detail={language === "es" ? "por preparar" : "to prepare"}/><Metric label={language === "es" ? "En casa" : "In house"} value={inHouse.length} detail={language === "es" ? "estancias activas" : "active stays"}/><Metric label={language === "es" ? "Saldos por cobrar" : "Balances due"} value={money(pending.reduce((total, item) => total + item.totalAmount - item.paidAmount, 0))} detail={`${pending.length} ${language === "es" ? "reservas" : "reservations"}`}/></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-2"><List title={language === "es" ? "Llegadas que requieren atención" : "Arrivals needing attention"} empty={arrivals.length === 0}>{arrivals.slice(0, 5).map((item) => <Row key={item.id} href="/dashboard/hoy" title={item.guestName} detail={item.propertyName} value={item.totalAmount > item.paidAmount ? money(item.totalAmount - item.paidAmount) : language === "es" ? "Pagado" : "Paid"}/>)}</List><List title={language === "es" ? "Cobros y conversaciones pendientes" : "Pending payments and conversations"} empty={pending.length === 0}>{pending.slice(0, 5).map((item) => <Row key={item.id} href="/dashboard/oportunidades" title={item.guestName} detail={`${item.propertyName} · ${item.stage}`} value={money(item.totalAmount - item.paidAmount)}/>)}</List></div>
  </Shell>;
}

function SalesDashboard({ reservations }: Pick<Props, "reservations">) {
  const { language } = useLanguage();
  const open = reservations.filter((item) => item.opportunityStatus === "OPEN");
  const quoted = open.filter((item) => item.hasQuote);
  const urgent = open.filter((item) => item.totalAmount > item.paidAmount).sort((a, b) => b.totalAmount - b.paidAmount - (a.totalAmount - a.paidAmount));
  return <Shell title={language === "es" ? "Ventas" : "Sales"} subtitle={language === "es" ? "Conversaciones que necesitan avanzar hoy" : "Conversations to move forward today"} actions={[{ label: language === "es" ? "Abrir oportunidades" : "Open opportunities", href: "/dashboard/oportunidades", tone: "dark" }, { label: language === "es" ? "Ir a bandeja" : "Open inbox", href: "/dashboard/inbox" }]}>
    <div className="mt-6 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-3"><Metric label={language === "es" ? "Oportunidades abiertas" : "Open opportunities"} value={open.length}/><Metric label={language === "es" ? "Cotizaciones enviadas" : "Quotes sent"} value={quoted.length}/><Metric label={language === "es" ? "Valor por cerrar" : "Value to close"} value={money(open.reduce((total, item) => total + item.totalAmount, 0))}/></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><List title={language === "es" ? "Prioridad comercial" : "Sales priority"} empty={urgent.length === 0}>{urgent.slice(0, 7).map((item) => <Row key={item.id} href="/dashboard/oportunidades" title={item.guestName} detail={`${item.propertyName} · ${item.hasQuote ? (language === "es" ? "Cotización enviada" : "Quote sent") : (language === "es" ? "Responder y cotizar" : "Reply and quote")}`} value={money(item.totalAmount - item.paidAmount)}/>)}</List><section className="border border-ink/10 bg-[#fff4dc] p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-ink/50">{language === "es" ? "Siguiente movimiento" : "Next move"}</p><h2 className="mt-3 font-display text-2xl font-extrabold text-ink">{language === "es" ? "Convierte conversaciones, no reportes." : "Move conversations, not reports."}</h2><p className="mt-3 text-sm leading-6 text-ink/60">{language === "es" ? "La lista prioriza dinero pendiente y oportunidades abiertas. El tablero completo vive en Oportunidades." : "This list prioritizes pending revenue and open opportunities. The full board lives in Opportunities."}</p></section></div>
  </Shell>;
}

function FrontDeskDashboard({ reservations }: Pick<Props, "reservations">) {
  const { language } = useLanguage();
  const today = useMemo(() => new Date(), []);
  const arrivals = reservations.filter((item) => isSameDay(item.checkIn, today));
  const departures = reservations.filter((item) => isSameDay(item.checkOut, today));
  return <Shell title={language === "es" ? "Recepción" : "Front desk"} subtitle={`${dayName(language)} · Check-ins, check-outs y cobros`} actions={[{ label: language === "es" ? "Abrir tablero de hoy" : "Open today board", href: "/dashboard/hoy", tone: "dark" }, { label: language === "es" ? "Reservas" : "Reservations", href: "/dashboard/reservas" }]}>
    <div className="mt-6 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2"><Metric label={language === "es" ? "Llegadas de hoy" : "Today's arrivals"} value={arrivals.length}/><Metric label={language === "es" ? "Salidas de hoy" : "Today's departures"} value={departures.length}/></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-2"><List title={language === "es" ? "Recibir huéspedes" : "Welcome guests"} empty={arrivals.length === 0}>{arrivals.map((item) => <Row key={item.id} href="/dashboard/hoy" title={item.guestName} detail={item.propertyName} value={item.totalAmount > item.paidAmount ? `${language === "es" ? "Debe" : "Due"} ${money(item.totalAmount - item.paidAmount)}` : language === "es" ? "Pagado" : "Paid"}/>)}</List><List title={language === "es" ? "Cerrar estancias" : "Close stays"} empty={departures.length === 0}>{departures.map((item) => <Row key={item.id} href="/dashboard/hoy" title={item.guestName} detail={item.propertyName} value={item.totalAmount > item.paidAmount ? `${language === "es" ? "Debe" : "Due"} ${money(item.totalAmount - item.paidAmount)}` : language === "es" ? "Pagado" : "Paid"}/>)}</List></div>
  </Shell>;
}

function MarketingDashboard({ reservations }: Pick<Props, "reservations">) {
  const { language } = useLanguage();
  const channels = Object.entries(reservations.reduce<Record<string, number>>((totals, item) => { const key = item.source || item.channel || "Directo"; totals[key] = (totals[key] || 0) + 1; return totals; }, {})).sort((a, b) => b[1] - a[1]);
  const direct = reservations.filter((item) => item.channel === "DIRECT" || item.source === "Web directa").length;
  return <Shell title="Marketing" subtitle={language === "es" ? "Demanda directa, canales y sitio web" : "Direct demand, channels and website"} actions={[{ label: language === "es" ? "Editar sitio" : "Edit website", href: "/dashboard/sitio?view=editor", tone: "dark" }, { label: language === "es" ? "Ver páginas" : "Open pages", href: "/dashboard/sitio?view=pages" }]}>
    <div className="mt-6 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-3"><Metric label={language === "es" ? "Reservas directas" : "Direct reservations"} value={direct}/><Metric label={language === "es" ? "Canales activos" : "Active channels"} value={channels.length}/><Metric label={language === "es" ? "Oportunidades originadas" : "Originated opportunities"} value={reservations.length}/></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><List title={language === "es" ? "Origen de la demanda" : "Demand sources"}>{channels.slice(0, 7).map(([channel, count]) => <Row key={channel} title={channel} detail={language === "es" ? "reservas registradas" : "recorded reservations"} value={`${count} · ${reservations.length ? Math.round((count / reservations.length) * 100) : 0}%`}/>)}</List><section className="border border-ink/10 bg-[#e8f3ee] p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-ink/50">{language === "es" ? "Trabajo de hoy" : "Today's work"}</p><h2 className="mt-3 font-display text-2xl font-extrabold text-ink">{language === "es" ? "Haz que el sitio convierta." : "Make the website convert."}</h2><p className="mt-3 text-sm leading-6 text-ink/60">{language === "es" ? "El editor y las páginas son el centro de trabajo. Aquí se ve qué canal está trayendo demanda." : "The editor and pages are the workspace. This view shows which channels bring demand."}</p></section></div>
  </Shell>;
}

function OperationsDashboard() {
  const { language } = useLanguage();
  return <Shell title={language === "es" ? "Mi operación" : "My operations"} subtitle={language === "es" ? "Tu turno, tareas y servicios asignados" : "Your shift, tasks and assigned services"} actions={[{ label: language === "es" ? "Abrir mi día" : "Open my day", href: "/dashboard/mi-dia", tone: "dark" }]}><section className="mt-6 max-w-2xl border border-ink/10 bg-white p-6"><h2 className="font-display text-2xl font-extrabold text-ink">{language === "es" ? "Todo lo que necesitas para tu turno está en MI DÍA." : "Everything needed for your shift is in MY DAY."}</h2><p className="mt-2 text-sm leading-6 text-ink/55">{language === "es" ? "Ahí encontrarás las tareas, checklists, servicios y el reporte de incidencias de acuerdo con tu puesto." : "There you will find role-specific tasks, checklists, services and issue reporting."}</p></section></Shell>;
}

export function RoleDashboard({
  reservations,
  commercialLines,
  propertyCount,
  averageNightlyRate,
  businessUnits,
}: Props) {
  const { employee } = useRole();
  switch (employee.dashboard) {
    case "executive": return <OwnerDashboard reservations={reservations} commercialLines={commercialLines} propertyCount={propertyCount} averageNightlyRate={averageNightlyRate} businessUnits={businessUnits} />;
    case "management": return <ManagerDashboard reservations={reservations} />;
    case "sales": return <SalesDashboard reservations={reservations} />;
    case "frontDesk": return <FrontDeskDashboard reservations={reservations} />;
    case "marketing": return <MarketingDashboard reservations={reservations} />;
    case "operations": return <OperationsDashboard />;
  }
}
