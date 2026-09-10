"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "../language-provider";
import { type AnalyticsReservation, type CommercialLine } from "./analytics-dashboard";
import { type DashboardBusinessUnit } from "./role-dashboard";

type Props = {
  reservations: AnalyticsReservation[];
  commercialLines: CommercialLine[];
  propertyCount: number;
  averageNightlyRate: number;
  businessUnits: DashboardBusinessUnit[];
};

type PeriodPreset = "month" | "last30" | "year";

type DateRange = {
  start: Date;
  end: Date;
};

type FinancialSummary = {
  sales: number;
  variableCost: number;
  throughput: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function rangeFor(preset: PeriodPreset, now = new Date()): DateRange {
  const today = startOfDay(now);

  if (preset === "last30") {
    return { start: addDays(today, -29), end: addDays(today, 1) };
  }

  if (preset === "year") {
    return {
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(today.getFullYear() + 1, 0, 1),
    };
  }

  return {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: new Date(today.getFullYear(), today.getMonth() + 1, 1),
  };
}

function previousRange(range: DateRange): DateRange {
  const duration = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - duration),
    end: new Date(range.start),
  };
}

function isInRange(value: string, range: DateRange) {
  const date = new Date(value);
  return date >= range.start && date < range.end;
}

function overlapNights(checkIn: string, checkOut: string, range: DateRange) {
  const start = Math.max(startOfDay(new Date(checkIn)).getTime(), range.start.getTime());
  const end = Math.min(startOfDay(new Date(checkOut)).getTime(), range.end.getTime());
  return Math.max(0, Math.round((end - start) / DAY_MS));
}

function periodDays(range: DateRange) {
  return Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / DAY_MS));
}

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function percentage(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function financialSummary(lines: CommercialLine[]): FinancialSummary {
  const sales = lines.reduce((sum, line) => sum + line.total, 0);
  const variableCost = lines.reduce((sum, line) => sum + line.unitCost * line.quantity, 0);
  return { sales, variableCost, throughput: sales - variableCost };
}

function comparisonLabel(current: number, previous: number, language: "es" | "en") {
  if (current === 0 && previous === 0) return language === "es" ? "Sin cambio" : "No change";
  if (previous === 0) return language === "es" ? "Nuevo en el periodo" : "New in period";
  const change = ((current - previous) / Math.abs(previous)) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% ${language === "es" ? "vs. periodo anterior" : "vs. previous period"}`;
}

function formatRange(range: DateRange, language: "es" | "en") {
  const locale = language === "es" ? "es-MX" : "en-US";
  const end = addDays(range.end, -1);
  const startText = range.start.toLocaleDateString(locale, { day: "numeric", month: "short" });
  const endText = end.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startText} - ${endText}`;
}

function unitMatches(line: CommercialLine, unit: DashboardBusinessUnit | undefined) {
  if (!unit) return true;
  return line.businessUnitName.trim().toLocaleLowerCase() === unit.name.trim().toLocaleLowerCase();
}

function statusText(type: string, language: "es" | "en") {
  const labels: Record<string, [string, string]> = {
    LODGING: ["Hospedaje", "Lodging"],
    RESTAURANT: ["Restaurante", "Restaurant"],
    SPA: ["Spa", "Spa"],
    OTHER: ["Otra", "Other"],
  };
  const label = labels[type] ?? [type, type];
  return language === "es" ? label[0] : label[1];
}

function Pillar({
  eyebrow,
  title,
  value,
  detail,
  comparison,
  color,
  missing = false,
}: {
  eyebrow: string;
  title: string;
  value: string;
  detail: string;
  comparison: string;
  color: string;
  missing?: boolean;
}) {
  return (
    <section className="relative min-h-[210px] overflow-hidden rounded-md border border-ink/10 bg-white p-5">
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">{eyebrow}</p>
      <h2 className="mt-3 text-sm font-bold text-ink">{title}</h2>
      <strong className={`mt-4 block font-display text-3xl font-extrabold ${missing ? "text-ink/45" : "text-ink"}`}>
        {value}
      </strong>
      <p className="mt-2 min-h-10 text-xs leading-5 text-ink/55">{detail}</p>
      <p className="mt-4 border-t border-ink/10 pt-3 text-xs font-bold text-ink/55">{comparison}</p>
    </section>
  );
}

function FinancialRow({
  label,
  value,
  width,
  color,
  note,
  muted = false,
}: {
  label: string;
  value: string;
  width: number;
  color: string;
  note?: string;
  muted?: boolean;
}) {
  return (
    <div className="grid gap-2 border-b border-ink/10 py-4 last:border-0 sm:grid-cols-[170px_1fr_130px] sm:items-center">
      <div>
        <p className={`text-sm font-bold ${muted ? "text-ink/45" : "text-ink"}`}>{label}</p>
        {note && <p className="mt-1 text-[11px] leading-4 text-ink/40">{note}</p>}
      </div>
      <div className="h-3 overflow-hidden rounded-sm bg-ink/[0.06]">
        <div
          className={`h-full ${muted ? "opacity-30" : ""}`}
          style={{ width: `${Math.max(muted ? 100 : 3, clamp(width))}%`, backgroundColor: color }}
        />
      </div>
      <strong className={`text-left text-sm sm:text-right ${muted ? "text-ink/40" : "text-ink"}`}>{value}</strong>
    </div>
  );
}

function ExecutionRow({
  label,
  value,
  detail,
  href,
  measured,
}: {
  label: string;
  value: string;
  detail: string;
  href: string;
  measured: boolean;
}) {
  return (
    <a href={href} className="grid gap-3 border-b border-ink/10 py-4 transition hover:bg-ink/[0.02] sm:grid-cols-[1fr_150px] sm:items-center">
      <div>
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="mt-1 text-xs leading-5 text-ink/50">{detail}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className={`h-2.5 w-2.5 rounded-full ${measured ? "bg-[#16855b]" : "bg-[#b4bbc4]"}`} />
        <strong className={`text-sm ${measured ? "text-ink" : "text-ink/45"}`}>{value}</strong>
      </div>
    </a>
  );
}

export function OwnerDashboard({
  reservations,
  commercialLines,
  propertyCount,
  averageNightlyRate,
  businessUnits,
}: Props) {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<PeriodPreset>("month");
  const [unitId, setUnitId] = useState("all");

  const selectedUnit = businessUnits.find((unit) => unit.id === unitId);
  const currentRange = useMemo(() => rangeFor(period), [period]);
  const priorRange = useMemo(() => previousRange(currentRange), [currentRange]);

  const data = useMemo(() => {
    const unitLines = commercialLines.filter((line) => unitMatches(line, selectedUnit));
    const currentLines = unitLines.filter((line) => isInRange(line.createdAt, currentRange));
    const priorLines = unitLines.filter((line) => isInRange(line.createdAt, priorRange));
    const currentFinancial = financialSummary(currentLines);
    const priorFinancial = financialSummary(priorLines);
    const showLodging = !selectedUnit || selectedUnit.type === "LODGING";
    const activeReservations = reservations.filter((reservation) => reservation.status !== "CANCELLED");
    const currentOccupied = showLodging
      ? activeReservations.reduce((sum, reservation) => sum + overlapNights(reservation.checkIn, reservation.checkOut, currentRange), 0)
      : 0;
    const priorOccupied = showLodging
      ? activeReservations.reduce((sum, reservation) => sum + overlapNights(reservation.checkIn, reservation.checkOut, priorRange), 0)
      : 0;
    const currentCapacity = propertyCount * periodDays(currentRange);
    const priorCapacity = propertyCount * periodDays(priorRange);
    const currentOccupancy = showLodging ? percentage(currentOccupied, currentCapacity) : 0;
    const priorOccupancy = showLodging ? percentage(priorOccupied, priorCapacity) : 0;
    const periodReservations = reservations.filter(
      (reservation) =>
        reservation.status !== "CANCELLED" &&
        overlapNights(reservation.checkIn, reservation.checkOut, currentRange) > 0,
    );
    const pendingBalance = periodReservations.reduce(
      (sum, reservation) => sum + Math.max(0, reservation.totalAmount - reservation.paidAmount),
      0,
    );
    const fullyPaid = periodReservations.filter(
      (reservation) => reservation.totalAmount > 0 && reservation.paidAmount >= reservation.totalAmount,
    ).length;
    const cancelled = showLodging
      ? reservations.filter(
        (reservation) =>
          reservation.status === "CANCELLED" &&
          overlapNights(reservation.checkIn, reservation.checkOut, currentRange) > 0,
      )
      : [];
    const cancelledValue = cancelled.reduce((sum, reservation) => sum + reservation.totalAmount, 0);
    const cancelledNights = cancelled.reduce(
      (sum, reservation) => sum + overlapNights(reservation.checkIn, reservation.checkOut, currentRange),
      0,
    );
    const availableNights = Math.max(0, currentCapacity - currentOccupied);
    const unsoldPotential = showLodging ? availableNights * averageNightlyRate : 0;

    return {
      currentLines,
      currentFinancial,
      priorFinancial,
      showLodging,
      currentOccupied,
      currentCapacity,
      currentOccupancy,
      priorOccupancy,
      periodReservations,
      pendingBalance,
      fullyPaid,
      cancelledValue,
      cancelledNights,
      availableNights,
      unsoldPotential,
    };
  }, [
    averageNightlyRate,
    commercialLines,
    currentRange,
    priorRange,
    propertyCount,
    reservations,
    selectedUnit,
  ]);

  const monthlyTrend = useMemo(() => {
    const reference = addDays(currentRange.end, -1);
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(reference.getFullYear(), reference.getMonth() - (5 - index), 1);
      const range = { start: month, end: new Date(month.getFullYear(), month.getMonth() + 1, 1) };
      const summary = financialSummary(
        commercialLines.filter((line) => unitMatches(line, selectedUnit) && isInRange(line.createdAt, range)),
      );
      return {
        label: month.toLocaleDateString(language === "es" ? "es-MX" : "en-US", { month: "short" }),
        ...summary,
      };
    });
  }, [commercialLines, currentRange, language, selectedUnit]);

  const unitPerformance = useMemo(() => {
    const visibleUnits = selectedUnit ? [selectedUnit] : businessUnits;
    return visibleUnits.map((unit) => {
      const summary = financialSummary(
        commercialLines.filter(
          (line) => unitMatches(line, unit) && isInRange(line.createdAt, currentRange),
        ),
      );
      return { unit, ...summary };
    });
  }, [businessUnits, commercialLines, currentRange, selectedUnit]);

  const financialMax = Math.max(data.currentFinancial.sales, 1);
  const trendMax = Math.max(...monthlyTrend.map((month) => month.sales), 1);
  const collectionRate = percentage(data.fullyPaid, data.periodReservations.length);
  const canShowOccupancy = data.showLodging && propertyCount > 0;

  const restriction = useMemo(() => {
    if (data.currentFinancial.sales === 0 && data.currentOccupied === 0) {
      return {
        title: language === "es" ? "La restricción visible es la falta de demanda registrada" : "The visible constraint is recorded demand",
        detail: language === "es"
          ? "No hay ventas cobradas ni noches ocupadas en el periodo seleccionado."
          : "There are no paid sales or occupied nights in the selected period.",
        action: language === "es" ? "Revisar oportunidades" : "Review opportunities",
        href: "/dashboard/oportunidades",
      };
    }

    if (data.pendingBalance > Math.max(data.currentFinancial.throughput * 0.15, 10000)) {
      return {
        title: language === "es" ? "La restricción visible está en cobranza" : "The visible constraint is collections",
        detail: language === "es"
          ? `${money(data.pendingBalance)} ya fueron vendidos, pero todavía no están cobrados. Ese dinero no puede alimentar la operación.`
          : `${money(data.pendingBalance)} has been sold but not yet collected, so it cannot support operations.`,
        action: language === "es" ? "Atender saldos" : "Work balances",
        href: "/dashboard/oportunidades",
      };
    }

    if (canShowOccupancy && data.currentOccupancy < 45) {
      return {
        title: language === "es" ? "La restricción visible está en llenar la capacidad disponible" : "The visible constraint is filling available capacity",
        detail: language === "es"
          ? `Solo se está usando ${data.currentOccupancy.toFixed(0)}% de la capacidad de hospedaje. El siguiente peso debe ir a generar demanda rentable.`
          : `Only ${data.currentOccupancy.toFixed(0)}% of lodging capacity is being used. The next investment should create profitable demand.`,
        action: language === "es" ? "Revisar oportunidades" : "Review opportunities",
        href: "/dashboard/oportunidades",
      };
    }

    if (canShowOccupancy && data.currentOccupancy > 85) {
      return {
        title: language === "es" ? "La restricción visible está en la capacidad disponible" : "The visible constraint is available capacity",
        detail: language === "es"
          ? "La ocupación deja poco espacio para crecer. Conviene proteger tarifa, disponibilidad y tiempos de preparación."
          : "Occupancy leaves little room to grow. Protect rate, availability and turnaround times.",
        action: language === "es" ? "Ver estado de unidades" : "Open unit status",
        href: "/dashboard/estado-unidades",
      };
    }

    return {
      title: language === "es" ? "Falta medir la ejecución para confirmar la restricción" : "Execution data is needed to confirm the constraint",
      detail: language === "es"
        ? "Ventas y ocupación están visibles, pero aún no sabemos qué proceso, turno o responsable está frenando el flujo."
        : "Sales and occupancy are visible, but the process, shift or owner slowing flow is not yet measured.",
      action: language === "es" ? "Configurar checklists" : "Configure checklists",
      href: "/dashboard/plantillas-checklists",
    };
  }, [
    canShowOccupancy,
    data.currentFinancial.sales,
    data.currentFinancial.throughput,
    data.currentOccupied,
    data.currentOccupancy,
    data.pendingBalance,
    language,
  ]);

  const text = (es: string, en: string) => language === "es" ? es : en;

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-[#f4f5f7]">
      <div className="mx-auto max-w-[1520px] px-4 py-5 sm:px-7 sm:py-7">
        <header className="flex flex-col gap-5 border-b border-ink/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
              {text("Vista del dueño", "Owner view")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              {text("Dirección del negocio", "Business direction")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink/55">
              {text(
                "Qué está generando dinero, qué está frenando el flujo y dónde conviene actuar primero.",
                "What is generating money, what is slowing flow, and where to act first.",
              )}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-ink/55">
              {text("Periodo", "Period")}
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as PeriodPreset)}
                className="mt-2 h-11 w-full min-w-48 rounded-md border border-ink/15 bg-white px-3 text-sm font-bold text-ink outline-none focus:border-ink/40"
              >
                <option value="month">{text("Este mes", "This month")}</option>
                <option value="last30">{text("Últimos 30 días", "Last 30 days")}</option>
                <option value="year">{text("Este año", "This year")}</option>
              </select>
            </label>
            <label className="text-xs font-bold text-ink/55">
              {text("Unidad de negocio", "Business unit")}
              <select
                value={unitId}
                onChange={(event) => setUnitId(event.target.value)}
                className="mt-2 h-11 w-full min-w-52 rounded-md border border-ink/15 bg-white px-3 text-sm font-bold text-ink outline-none focus:border-ink/40"
              >
                <option value="all">{text("Todo el negocio", "Entire business")}</option>
                {businessUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
              </select>
            </label>
          </div>
        </header>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-ink/50">{formatRange(currentRange, language)}</p>
          <p className="text-xs text-ink/40">
            {text("Solo datos registrados en Hostflow", "Only data recorded in Hostflow")}
          </p>
        </div>

        <section className="mt-5 grid gap-4 lg:grid-cols-3" aria-label={text("Pilares del negocio", "Business pillars")}>
          <Pillar
            eyebrow={text("1. Resultado económico", "1. Financial result")}
            title={text("Dinero que dejan las ventas", "Money left by sales")}
            value={money(data.currentFinancial.throughput)}
            detail={text(
              `${money(data.currentFinancial.sales)} cobrados menos ${money(data.currentFinancial.variableCost)} de costo variable estimado.`,
              `${money(data.currentFinancial.sales)} collected minus ${money(data.currentFinancial.variableCost)} in estimated variable costs.`,
            )}
            comparison={comparisonLabel(data.currentFinancial.throughput, data.priorFinancial.throughput, language)}
            color="#16855b"
          />
          <Pillar
            eyebrow={text("2. Ejecución operativa", "2. Operational execution")}
            title={text("Qué tanto se siguen los procesos", "How consistently processes are followed")}
            value={text("Por configurar", "Setup needed")}
            detail={text(
              "Hostflow aún no guarda la ejecución de checklists, incidencias ni responsables por turno.",
              "Hostflow does not yet store checklist execution, incidents, or shift ownership.",
            )}
            comparison={text("No se inventó un promedio sin evidencia", "No score was invented without evidence")}
            color="#6f7782"
            missing
          />
          <Pillar
            eyebrow={text("3. Capacidad y ocupación", "3. Capacity and occupancy")}
            title={data.showLodging ? text("Uso de la capacidad de hospedaje", "Use of lodging capacity") : text("Uso de la capacidad", "Capacity use")}
            value={canShowOccupancy ? `${data.currentOccupancy.toFixed(0)}%` : text("Por configurar", "Setup needed")}
            detail={canShowOccupancy
              ? text(
                `${data.currentOccupied} de ${data.currentCapacity} noches disponibles fueron ocupadas.`,
                `${data.currentOccupied} of ${data.currentCapacity} available room nights were occupied.`,
              )
              : text(
                "Esta unidad aún no tiene lugares, turnos o capacidad operativa configurados.",
                "This unit does not yet have seats, shifts, or operating capacity configured.",
              )}
            comparison={canShowOccupancy
              ? comparisonLabel(data.currentOccupancy, data.priorOccupancy, language)
              : text("Sin base para comparar", "No comparison baseline")}
            color="#cc8a19"
            missing={!canShowOccupancy}
          />
        </section>

        <section className="mt-4 grid gap-5 rounded-md border border-[#d8aa22]/45 bg-[#fff7dc] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#765800]">
              {text("Lo que hoy limita el crecimiento", "What limits growth today")}
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold text-ink">{restriction.title}</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-ink/60">{restriction.detail}</p>
          </div>
          <a href={restriction.href} className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-black">
            {restriction.action}
          </a>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
          <div className="rounded-md border border-ink/10 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  {text("De la venta al resultado", "From sales to result")}
                </p>
                <h2 className="mt-2 font-display text-xl font-extrabold text-ink">
                  {text("Cómo se genera el dinero", "How money is generated")}
                </h2>
              </div>
              <span className="rounded-sm bg-[#edf5f1] px-2.5 py-1.5 text-xs font-bold text-[#116645]">
                {text("Datos cobrados", "Collected data")}
              </span>
            </div>
            <div className="mt-5">
              <FinancialRow
                label={text("Ventas cobradas", "Collected sales")}
                value={money(data.currentFinancial.sales)}
                width={100}
                color="#2f6f9f"
              />
              <FinancialRow
                label={text("Costo variable", "Variable cost")}
                value={`- ${money(data.currentFinancial.variableCost)}`}
                width={percentage(data.currentFinancial.variableCost, financialMax)}
                color="#c95b4b"
                note={text("Estimado con el costo actual del catálogo", "Estimated with current catalog costs")}
              />
              <FinancialRow
                label={text("Dinero que dejan las ventas", "Money left by sales")}
                value={money(data.currentFinancial.throughput)}
                width={percentage(data.currentFinancial.throughput, financialMax)}
                color="#16855b"
              />
              <FinancialRow
                label={text("Gasto operativo", "Operating expense")}
                value={text("Sin registrar", "Not recorded")}
                width={100}
                color="#a9afb7"
                note={text("Nómina, renta, servicios y otros gastos fijos", "Payroll, rent, utilities, and other fixed expenses")}
                muted
              />
              <FinancialRow
                label={text("Resultado final", "Final result")}
                value={text("Por calcular", "Pending")}
                width={100}
                color="#7f8791"
                note={text("Se activará cuando se registren gastos operativos", "Available after operating expenses are recorded")}
                muted
              />
            </div>
            <a href="/dashboard/gastos" className="mt-4 inline-flex text-sm font-bold text-ink underline decoration-ink/25 underline-offset-4">
              {text("Completar gastos operativos", "Complete operating expenses")}
            </a>
          </div>

          <div className="rounded-md border border-ink/10 bg-white p-5 sm:p-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                {text("Contexto", "Context")}
              </p>
              <h2 className="mt-2 font-display text-xl font-extrabold text-ink">
                {text("Últimos seis meses", "Last six months")}
              </h2>
              <p className="mt-1 text-xs text-ink/45">
                {text("Ventas cobradas vs. dinero que dejan", "Collected sales vs. money left")}
              </p>
            </div>
            <div className="mt-7 grid h-[225px] grid-cols-6 gap-2 border-b border-ink/15 sm:gap-4">
              {monthlyTrend.map((month) => (
                <div key={month.label} className="flex min-w-0 flex-col items-center justify-end gap-2">
                  <div className="flex h-[170px] w-full items-end justify-center gap-1 sm:gap-2" title={`${month.label}: ${money(month.sales)}`}>
                    <div
                      className="w-[34%] min-w-2 bg-[#8eb2cb]"
                      style={{ height: `${Math.max(month.sales ? 4 : 0, (month.sales / trendMax) * 100)}%` }}
                    />
                    <div
                      className="w-[34%] min-w-2 bg-[#16855b]"
                      style={{ height: `${Math.max(month.throughput ? 4 : 0, (month.throughput / trendMax) * 100)}%` }}
                    />
                  </div>
                  <span className="w-full truncate text-center text-[11px] font-bold capitalize text-ink/45">{month.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-xs font-bold text-ink/55">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 bg-[#8eb2cb]" />{text("Ventas", "Sales")}</span>
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 bg-[#16855b]" />{text("Dinero que dejan", "Money left")}</span>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-md border border-ink/10 bg-white p-5 sm:p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
              {text("Ejecución operativa", "Operational execution")}
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold text-ink">
              {text("¿La operación está siguiendo el sistema?", "Is the operation following the system?")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/50">
              {text(
                "Se muestran señales por separado hasta tener evidencia suficiente para construir un índice confiable.",
                "Signals remain separate until there is enough evidence to build a reliable index.",
              )}
            </p>
            <div className="mt-4">
              <ExecutionRow
                label={text("Reservas con cobro completo", "Reservations fully collected")}
                value={`${collectionRate.toFixed(0)}%`}
                detail={text(
                  `${data.fullyPaid} de ${data.periodReservations.length} reservas del periodo.`,
                  `${data.fullyPaid} of ${data.periodReservations.length} reservations in the period.`,
                )}
                href="/dashboard/reservas"
                measured
              />
              <ExecutionRow
                label={text("Rutinas y checklists", "Routines and checklists")}
                value={text("Sin medir", "Not measured")}
                detail={text("Apertura, cierre, limpieza y preparación.", "Opening, closing, cleaning, and preparation.")}
                href="/dashboard/plantillas-checklists"
                measured={false}
              />
              <ExecutionRow
                label={text("Incidencias resueltas a tiempo", "Incidents resolved on time")}
                value={text("Sin medir", "Not measured")}
                detail={text("Se necesita registrar responsable, prioridad y cierre.", "Owner, priority, and resolution must be recorded.")}
                href="/dashboard/mi-dia"
                measured={false}
              />
              <ExecutionRow
                label={text("Cumplimiento por responsable", "Compliance by owner")}
                value={text("Sin medir", "Not measured")}
                detail={text("Incluye gerente, encargados y personal operativo.", "Includes manager, leads, and operating staff.")}
                href="/dashboard/equipo/miembros"
                measured={false}
              />
            </div>
          </div>

          <div className="rounded-md border border-ink/10 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                  {text("Capacidad y ocupación", "Capacity and occupancy")}
                </p>
                <h2 className="mt-2 font-display text-xl font-extrabold text-ink">
                  {text("Lo que tenemos vs. lo que usamos", "What we have vs. what we use")}
                </h2>
              </div>
              {canShowOccupancy && <strong className="font-display text-2xl font-extrabold text-ink">{data.currentOccupancy.toFixed(0)}%</strong>}
            </div>

            {canShowOccupancy ? (
              <>
                <div className="mt-7 h-5 overflow-hidden rounded-sm bg-[#dfe4e8]" aria-label={text("Distribución de capacidad", "Capacity distribution")}>
                  <div
                    className="h-full bg-[#cc8a19]"
                    style={{ width: `${clamp(data.currentOccupancy)}%` }}
                    title={text(`${data.currentOccupied} noches ocupadas`, `${data.currentOccupied} occupied room nights`)}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold text-ink/45">{text("Ocupadas", "Occupied")}</p>
                    <strong className="mt-1 block text-xl text-ink">{data.currentOccupied}</strong>
                    <p className="text-[11px] text-ink/40">{text("noches", "room nights")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink/45">{text("Disponibles", "Available")}</p>
                    <strong className="mt-1 block text-xl text-ink">{data.availableNights}</strong>
                    <p className="text-[11px] text-ink/40">{text("noches sin vender", "unsold room nights")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink/45">{text("Canceladas", "Cancelled")}</p>
                    <strong className="mt-1 block text-xl text-ink">{data.cancelledNights}</strong>
                    <p className="text-[11px] text-ink/40">{text("noches liberadas", "released room nights")}</p>
                  </div>
                </div>
                <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-5 text-ink/45">
                  {text(
                    "Capacidad operativa real y unidades fuera de servicio todavía no se registran; por ahora se usa el inventario total de propiedades.",
                    "Operating capacity and out-of-service units are not yet recorded; total property inventory is used for now.",
                  )}
                </p>
              </>
            ) : (
              <div className="mt-6 border-l-4 border-[#cc8a19] bg-[#fff8e9] p-4">
                <strong className="text-sm text-ink">{text("Capacidad pendiente de configurar", "Capacity setup pending")}</strong>
                <p className="mt-2 text-xs leading-5 text-ink/50">
                  {text(
                    "Define lugares, turnos, terapeutas o servicios máximos para saber qué tanto se está aprovechando esta unidad.",
                    "Define seats, shifts, therapists, or maximum services to measure how this unit is being used.",
                  )}
                </p>
              </div>
            )}
            <a href="/dashboard/estado-unidades" className="mt-5 inline-flex text-sm font-bold text-ink underline decoration-ink/25 underline-offset-4">
              {text("Configurar capacidad operativa", "Configure operating capacity")}
            </a>
          </div>
        </section>

        <section className="mt-8 rounded-md border border-ink/10 bg-white">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 px-5 py-5 sm:px-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                {text("Desempeño del sistema", "System performance")}
              </p>
              <h2 className="mt-2 font-display text-xl font-extrabold text-ink">
                {text("Qué aporta cada unidad de negocio", "What each business unit contributes")}
              </h2>
            </div>
            <p className="text-xs text-ink/45">{text("Costos estimados con catálogo actual", "Costs estimated with current catalog")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-ink/[0.025] text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink/45">
                <tr>
                  <th className="px-6 py-3">{text("Unidad", "Unit")}</th>
                  <th className="px-4 py-3 text-right">{text("Ventas", "Sales")}</th>
                  <th className="px-4 py-3 text-right">{text("Costo variable", "Variable cost")}</th>
                  <th className="px-4 py-3 text-right">{text("Dinero que deja", "Money left")}</th>
                  <th className="px-6 py-3 text-right">{text("% de venta", "% of sales")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {unitPerformance.map(({ unit, sales, variableCost, throughput }) => (
                  <tr key={unit.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: unit.color }} />
                        <div>
                          <p className="text-sm font-bold text-ink">{unit.name}</p>
                          <p className="mt-0.5 text-[11px] text-ink/40">{statusText(unit.type, language)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-ink">{money(sales)}</td>
                    <td className="px-4 py-4 text-right text-sm text-ink/55">{money(variableCost)}</td>
                    <td className="px-4 py-4 text-right text-sm font-bold text-[#116645]">{money(throughput)}</td>
                    <td className="px-6 py-4 text-right text-sm text-ink/55">{percentage(throughput, sales).toFixed(0)}%</td>
                  </tr>
                ))}
                {unitPerformance.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-ink/40">{text("No hay unidades activas.", "There are no active units.")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-md border border-ink/10 bg-white p-5 sm:p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
              {text("Dónde se queda el resultado", "Where results get stuck")}
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold text-ink">
              {text("Dinero comprometido o no aprovechado", "Committed or unused money")}
            </h2>
            <div className="mt-5 divide-y divide-ink/10">
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-bold text-ink">{text("Saldos por cobrar", "Balances to collect")}</p>
                  <p className="mt-1 text-xs text-ink/45">{text("Venta realizada que todavía no entra", "Completed sale not yet collected")}</p>
                </div>
                <strong className="text-base text-[#a54a39]">{money(data.pendingBalance)}</strong>
              </div>
              {data.showLodging && (
                <>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-ink">{text("Reservas canceladas", "Cancelled reservations")}</p>
                      <p className="mt-1 text-xs text-ink/45">{text("Valor reservado que se perdió en el periodo", "Reserved value lost in the period")}</p>
                    </div>
                    <strong className="text-base text-ink">{money(data.cancelledValue)}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-bold text-ink">{text("Capacidad sin vender", "Unsold capacity")}</p>
                      <p className="mt-1 text-xs text-ink/45">{text("Potencial estimado con la tarifa promedio", "Estimated potential at average nightly rate")}</p>
                    </div>
                    <strong className="text-base text-ink">{money(data.unsoldPotential)}</strong>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-bold text-ink">{text("Gasto operativo", "Operating expense")}</p>
                  <p className="mt-1 text-xs text-ink/45">{text("No es posible saber si el dinero generado se convierte en utilidad", "It is not yet possible to know whether generated money becomes profit")}</p>
                </div>
                <strong className="text-sm text-ink/40">{text("Sin registrar", "Not recorded")}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-ink/10 bg-[#111827] p-5 text-white sm:p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/45">
              {text("Decisiones para completar el sistema", "Decisions to complete the system")}
            </p>
            <h2 className="mt-2 font-display text-xl font-extrabold">
              {text("Qué conviene resolver ahora", "What to solve next")}
            </h2>
            <div className="mt-5 divide-y divide-white/10">
              <a href="/dashboard/gastos" className="block py-4 transition hover:bg-white/[0.03]">
                <span className="text-xs font-bold text-[#f5d45d]">01</span>
                <p className="mt-1 text-sm font-bold">{text("Registrar gasto operativo", "Record operating expense")}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{text("Desbloquea el resultado final real.", "Unlocks the real final result.")}</p>
              </a>
              <a href="/dashboard/plantillas-checklists" className="block py-4 transition hover:bg-white/[0.03]">
                <span className="text-xs font-bold text-[#f5d45d]">02</span>
                <p className="mt-1 text-sm font-bold">{text("Digitalizar los procesos críticos", "Digitize critical processes")}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{text("Permite medir cumplimiento por puesto y turno.", "Measures compliance by role and shift.")}</p>
              </a>
              <a href="/dashboard/estado-unidades" className="block py-4 transition hover:bg-white/[0.03]">
                <span className="text-xs font-bold text-[#f5d45d]">03</span>
                <p className="mt-1 text-sm font-bold">{text("Definir capacidad operativa", "Define operating capacity")}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{text("Separa lo instalado de lo que realmente se puede atender.", "Separates installed capacity from what can actually be served.")}</p>
              </a>
            </div>
          </div>
        </section>

        <footer className="mt-7 border-t border-ink/10 py-5 text-xs leading-5 text-ink/40">
          {text(
            `Criterio: dinero que dejan las ventas = ventas cobradas - costo variable. La utilidad final requiere gasto operativo. Actualizado con ${data.currentLines.length} partidas cobradas del periodo.`,
            `Method: money left by sales = collected sales - variable cost. Final profit requires operating expense. Updated with ${data.currentLines.length} collected line items in the period.`,
          )}
        </footer>
      </div>
    </main>
  );
}
