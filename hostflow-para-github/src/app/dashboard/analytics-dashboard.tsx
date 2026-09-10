"use client";

import { useMemo, useState } from "react";
import { marketingSourceOf, type MarketingSource } from "@/lib/marketing-source";
import {
  PIPELINE_STAGES,
  STAGE_COLORS,
  STAGE_LABELS,
  reachedStage,
  stageOf,
  type PipelineStage,
} from "@/lib/pipeline";
import { type TranslationKey, useLanguage } from "../language-provider";

export type AnalyticsReservation = {
  id: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  status: string;
  stage: PipelineStage;
  opportunityStatus: "OPEN" | "WON" | "LOST" | "ABANDONED";
  channel: string;
  totalAmount: number;
  paidAmount: number;
  hasQuote: boolean;
  source: string | null;
  guestName: string;
  propertyName: string;
};

export type CommercialLine = {
  id: string;
  saleId: string;
  createdAt: string;
  itemName: string;
  businessUnitName: string;
  categoryName: string;
  quantity: number;
  total: number;
  unitCost: number;
};

type RangePreset = "today" | "next7" | "last30" | "thisMonth" | "thisYear" | "custom";
type MeasureMode = "reservation" | "stay";

type DateRange = {
  from: string;
  to: string;
  label: RangePreset;
};

type MetricSlice = {
  label: string;
  value: number;
  color: string;
};

type ChannelId = MarketingSource;

type ChannelMetric = {
  id: ChannelId;
  label: string;
  count: number;
  value: number;
  percentage: number;
  color: string;
};

const chartColors = ["#2563eb", "#0f9d76", "#d8aa22", "#d45a5a", "#6f5bd3"];

const channelDefinitions: { id: ChannelId; labelKey: TranslationKey; color: string }[] = [
  { id: "instagram", labelKey: "channel.instagram", color: "#d94f8e" },
  { id: "facebook", labelKey: "channel.facebook", color: "#2563eb" },
  { id: "booking", labelKey: "channel.booking", color: "#163c91" },
  { id: "airbnb", labelKey: "channel.airbnb", color: "#e65561" },
  { id: "direct", labelKey: "channel.direct", color: "#0f9d76" },
  { id: "whatsapp", labelKey: "channel.whatsapp", color: "#31a866" },
  { id: "vrbo", labelKey: "channel.vrbo", color: "#5f55a5" },
  { id: "google", labelKey: "channel.google", color: "#d8aa22" },
  { id: "referral", labelKey: "channel.referral", color: "#d97732" },
  { id: "other", labelKey: "channel.other", color: "#75808f" },
];

function dateToInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function presetRange(preset: RangePreset): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === "today") {
    return { from: dateToInput(today), to: dateToInput(today), label: preset };
  }
  if (preset === "next7") {
    const end = addDateDays(today, 6);
    return { from: dateToInput(today), to: dateToInput(end), label: preset };
  }
  if (preset === "thisMonth") {
    return {
      from: dateToInput(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: dateToInput(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
      label: preset,
    };
  }
  if (preset === "thisYear") {
    return {
      from: dateToInput(new Date(today.getFullYear(), 0, 1)),
      to: dateToInput(new Date(today.getFullYear(), 11, 31)),
      label: preset,
    };
  }
  return { from: dateToInput(daysAgo(29)), to: dateToInput(today), label: "last30" };
}

function addDateDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function percentage(value: number, total: number) {
  return total ? (value / total) * 100 : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function monthCells(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function MonthCalendar({
  month,
  from,
  to,
  onSelect,
}: {
  month: Date;
  from: string;
  to: string;
  onSelect: (date: string) => void;
}) {
  const { language } = useLanguage();
  const cells = monthCells(month);
  const locale = language === "es" ? "es-MX" : "en-US";
  const monthLabel = month.toLocaleDateString(locale, { month: "short", year: "numeric" });
  const weekDays = language === "es"
    ? ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-[280px] shrink-0">
      <p className="text-center text-sm font-bold text-ink">{monthLabel}</p>
      <div className="mt-4 grid grid-cols-7 text-center text-xs font-semibold text-ink/55">
        {weekDays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1">
        {cells.map((date) => {
          const value = dateToInput(date);
          const inMonth = date.getMonth() === month.getMonth();
          const inRange = value >= from && value <= to;
          const endpoint = value === from || value === to;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              aria-pressed={endpoint}
              aria-label={date.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}
              className={`mx-auto grid h-8 w-9 place-items-center text-xs font-semibold transition ${
                endpoint
                  ? "rounded-full bg-[#2468ec] text-white"
                  : inRange
                    ? "bg-[#e7edff] text-[#215edf]"
                    : inMonth
                      ? "text-ink hover:bg-ink/5"
                      : "text-ink/20"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ range, measure, onApply }: { range: DateRange; measure: MeasureMode; onApply: (range: DateRange) => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(range);
  const [baseMonth, setBaseMonth] = useState(() => {
    const date = new Date(`${range.from}T00:00:00`);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const nextMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);

  function selectDay(value: string) {
    if (draft.from === draft.to || value < draft.from || value < draft.to) {
      setDraft({ from: value, to: value, label: "custom" });
      return;
    }
    setDraft((current) => ({ ...current, to: value, label: "custom" }));
  }

  function choosePreset(value: RangePreset) {
    if (value === "custom") {
      setDraft((current) => ({ ...current, label: value }));
      return;
    }
    const next = presetRange(value);
    setDraft(next);
    const date = new Date(`${next.from}T00:00:00`);
    setBaseMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setDraft(range);
          setOpen((current) => !current);
        }}
        className="flex h-11 items-center gap-3 rounded-md border border-ink/15 bg-white px-4 text-sm font-bold text-ink shadow-sm"
        aria-expanded={open}
      >
        <span aria-hidden="true">▣</span>
        {t(`date.${range.label}` as TranslationKey)}
        <span className="text-ink/45">⌄</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/10" onMouseDown={() => setOpen(false)}>
          <section
            className="absolute right-5 top-20 max-h-[calc(100vh-100px)] w-[min(980px,calc(100vw-40px))] overflow-auto rounded-md border border-ink/10 bg-white p-7 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
            aria-label={t("date.select")}
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_290px]">
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setBaseMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                    className="grid h-9 w-9 place-items-center rounded-md text-xl hover:bg-ink/5"
                    aria-label={t("date.previousMonth")}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setBaseMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                    className="grid h-9 w-9 place-items-center rounded-md text-xl hover:bg-ink/5"
                    aria-label={t("date.nextMonth")}
                  >
                    ›
                  </button>
                </div>
                <div className="flex min-w-max gap-8">
                  <MonthCalendar month={baseMonth} from={draft.from} to={draft.to} onSelect={selectDay} />
                  <MonthCalendar month={nextMonth} from={draft.from} to={draft.to} onSelect={selectDay} />
                </div>
              </div>

              <div>
                <h2 className="text-base font-bold text-ink">{t("date.select")}</h2>
                <select
                  value={draft.label}
                  onChange={(event) => choosePreset(event.target.value as RangePreset)}
                  className="mt-4 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"
                  aria-label={t("date.preset")}
                >
                  {(["today", ...(measure === "stay" ? ["next7" as const] : []), "thisMonth", "last30", "thisYear", "custom"] as RangePreset[]).map((preset) => (
                    <option key={preset} value={preset}>{t(`date.${preset}` as TranslationKey)}</option>
                  ))}
                </select>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <label className="text-xs font-bold text-ink">
                    {t("date.from")}
                    <input
                      type="date"
                      value={draft.from}
                      onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value, label: "custom" }))}
                      className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    />
                  </label>
                  <label className="text-xs font-bold text-ink">
                    {t("date.to")}
                    <input
                      type="date"
                      value={draft.to}
                      onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value, label: "custom" }))}
                      className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    />
                  </label>
                </div>
                <div className="mt-6 border-t border-ink/10 pt-5">
                  <p className="text-xs font-bold text-ink">{t("date.comparison")}</p>
                  <select className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm" aria-label={t("date.comparison")}>
                    <option>{t("date.noComparison")}</option>
                    <option>{t("date.previousPeriod")}</option>
                    <option>{t("date.previousYear")}</option>
                  </select>
                </div>
                <div className="mt-8 flex gap-3 border-t border-ink/10 pt-5">
                  <button type="button" onClick={() => setOpen(false)} className="h-11 flex-1 rounded-md border border-ink/15 text-sm font-bold">{t("common.cancel")}</button>
                  <button
                    type="button"
                    onClick={() => {
                      const normalized = draft.from <= draft.to ? draft : { ...draft, from: draft.to, to: draft.from };
                      onApply(normalized);
                      setOpen(false);
                    }}
                    className="h-11 flex-1 rounded-md bg-[#2468ec] text-sm font-bold text-white"
                  >
                    {t("common.apply")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function conicGradient(slices: MetricSlice[]) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  let cursor = 0;
  const stops = slices.map((slice) => {
    const start = cursor;
    cursor += (slice.value / total) * 360;
    return `${slice.color} ${start}deg ${cursor}deg`;
  });
  return `conic-gradient(${stops.join(",")})`;
}

function Donut({ slices, center }: { slices: MetricSlice[]; center: string }) {
  return (
    <div className="relative h-44 w-44 shrink-0">
      <div className="absolute inset-0 rounded-full" style={{ background: conicGradient(slices) }} />
      <div className="absolute inset-[17px] grid place-items-center rounded-full bg-white text-center">
        <span className="text-2xl font-semibold text-ink">{center}</span>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <section className="min-w-0 overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
      <header className="flex h-14 items-center justify-between border-b border-ink/10 px-5">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-md text-ink/45 hover:bg-ink/5" aria-label={`${t("dashboard.configure")} ${title}`}>⌘</button>
      </header>
      {children}
    </section>
  );
}

function ReservationHistory({ reservations, range, measure }: { reservations: AnalyticsReservation[]; range: DateRange; measure: MeasureMode }) {
  const { language, t } = useLanguage();
  const locale = language === "es" ? "es-MX" : "en-US";
  const history = useMemo(() => {
    const from = new Date(`${range.from}T00:00:00`);
    const to = new Date(`${range.to}T23:59:59`);
    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86_400_000) + 1);
    const granularity = days <= 45 ? "day" : days <= 180 ? "week" : "month";
    const buckets: { key: string; label: string; value: number }[] = [];
    let cursor = new Date(from);
    while (cursor <= to) {
      const start = new Date(cursor);
      const key = dateToInput(start);
      const label = granularity === "day"
        ? start.toLocaleDateString(locale, { day: "numeric", month: "short" })
        : granularity === "week"
          ? start.toLocaleDateString(locale, { day: "numeric", month: "short" })
          : start.toLocaleDateString(locale, { month: "short", year: "2-digit" });
      buckets.push({ key, label, value: 0 });
      if (granularity === "day") cursor = addDateDays(cursor, 1);
      else if (granularity === "week") cursor = addDateDays(cursor, 7);
      else cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    reservations.forEach((reservation) => {
      if (["LOST", "ABANDONED"].includes(reservation.opportunityStatus)) return;
      const eventDate = new Date(measure === "reservation" ? reservation.createdAt : reservation.checkIn);
      let index = 0;
      if (granularity === "day") index = Math.floor((eventDate.getTime() - from.getTime()) / 86_400_000);
      else if (granularity === "week") index = Math.floor((eventDate.getTime() - from.getTime()) / (7 * 86_400_000));
      else index = (eventDate.getFullYear() - from.getFullYear()) * 12 + eventDate.getMonth() - from.getMonth();
      if (buckets[index]) buckets[index].value += 1;
    });
    const maxValue = Math.max(4, Math.ceil(Math.max(1, ...buckets.map((bucket) => bucket.value)) / 4) * 4);
    const peak = buckets.reduce((best, bucket) => bucket.value > best.value ? bucket : best, buckets[0] ?? { key: "", label: "-", value: 0 });
    return { buckets, maxValue, peak, granularity };
  }, [locale, measure, range, reservations]);

  const width = 960;
  const height = 270;
  const padding = { top: 24, right: 24, bottom: 44, left: 48 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const x = (index: number) => padding.left + (index / Math.max(1, history.buckets.length - 1)) * plotWidth;
  const y = (value: number) => padding.top + plotHeight - (value / history.maxValue) * plotHeight;
  const points = history.buckets.map((bucket, index) => `${x(index)},${y(bucket.value)}`).join(" ");
  const labelStep = Math.max(1, Math.ceil(history.buckets.length / 12));

  return (
    <Panel title={t("dashboard.history")}>
      <div className="border-b border-ink/10 px-5 py-4">
        <p className="text-sm text-ink/50">{measure === "reservation" ? (language === "es" ? "Reservas creadas dentro del periodo" : "Reservations created within the period") : t("dashboard.historyHint")}</p>
        <p className="mt-2 text-xs font-bold uppercase text-ink/35">{history.granularity === "day" ? (language === "es" ? "Vista diaria" : "Daily view") : history.granularity === "week" ? (language === "es" ? "Vista semanal" : "Weekly view") : (language === "es" ? "Vista mensual" : "Monthly view")}</p>
      </div>
      <div className="overflow-x-auto px-3 pb-3 pt-5 sm:px-5">
        <svg className="h-[270px] min-w-[720px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t("dashboard.history")}>
          {Array.from({ length: 5 }, (_, index) => {
            const value = (history.maxValue / 4) * index;
            const lineY = y(value);
            return <g key={value}><line x1={padding.left} x2={width - padding.right} y1={lineY} y2={lineY} stroke="#e4e7ec" /><text x={padding.left - 12} y={lineY + 4} textAnchor="end" fill="#7b8190" fontSize="11">{Math.round(value)}</text></g>;
          })}
          {history.buckets.map((bucket, index) => index % labelStep === 0 && <text key={bucket.key} x={x(index)} y={height - 14} textAnchor="middle" fill="#687080" fontSize="11">{bucket.label}</text>)}
          <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {history.buckets.map((bucket, index) => <circle key={bucket.key} cx={x(index)} cy={y(bucket.value)} r="4" fill="white" stroke="#2563eb" strokeWidth="3" />)}
        </svg>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-ink/10 bg-ink/[0.02] px-5 py-4 text-sm"><span className="text-ink/50">{t("dashboard.peakSeason")}</span><strong>{history.peak.label} · {history.peak.value} {t("dashboard.reservations")}</strong></div>
    </Panel>
  );
}

export function AnalyticsDashboard({ reservations, commercialLines }: { reservations: AnalyticsReservation[]; commercialLines: CommercialLine[] }) {
  const { language, t } = useLanguage();
  const [measure, setMeasure] = useState<MeasureMode>("stay");
  const [range, setRange] = useState<DateRange>(() => presetRange("thisYear"));
  const locale = language === "es" ? "es-MX" : "en-US";

  const filtered = useMemo(() => reservations.filter((reservation) => {
    if (measure === "reservation") {
      const created = reservation.createdAt.slice(0, 10);
      return created >= range.from && created <= range.to;
    }
    return reservation.checkIn.slice(0, 10) <= range.to && reservation.checkOut.slice(0, 10) >= range.from;
  }), [measure, range, reservations]);

  const metrics = useMemo(() => {
    const resolved = filtered.map((reservation) => ({ reservation, stage: stageOf(reservation) }));
    const totalValue = filtered.reduce((sum, reservation) => sum + reservation.totalAmount, 0);
    const paidValue = filtered.reduce((sum, reservation) => sum + reservation.paidAmount, 0);
    const stageSlices: MetricSlice[] = PIPELINE_STAGES.map((stage) => ({
      label: STAGE_LABELS[language][stage],
      value: resolved.filter((item) => item.stage === stage).length,
      color: STAGE_COLORS[stage],
    }));
    const channels: ChannelMetric[] = channelDefinitions.map((definition) => {
      const matching = filtered.filter((reservation) => marketingSourceOf(reservation) === definition.id);
      return { id: definition.id, label: t(definition.labelKey), count: matching.length, value: matching.reduce((sum, reservation) => sum + reservation.totalAmount, 0), percentage: percentage(matching.length, filtered.length), color: definition.color };
    }).sort((a, b) => b.count - a.count || b.value - a.value);
    const funnelStages = PIPELINE_STAGES;
    const funnel = funnelStages.map((stage) => ({
      label: STAGE_LABELS[language][stage],
      value: resolved.filter((item) => reachedStage(item.stage, stage)).length,
      color: STAGE_COLORS[stage],
    }));
    const propertyMap = new Map<string, number>();
    filtered.forEach((reservation) => propertyMap.set(reservation.propertyName, (propertyMap.get(reservation.propertyName) ?? 0) + 1));
    const propertySlices = Array.from(propertyMap.entries()).sort((a, b) => b[1] - a[1]).map(([label, value], index) => ({ label, value, color: chartColors[index % chartColors.length] }));
    const converted = resolved.filter((item) => item.reservation.opportunityStatus === "WON").length;
    const open = resolved.filter((item) => item.reservation.opportunityStatus === "OPEN").length;
    return { totalValue, paidValue, stageSlices, channels, funnel, propertySlices, converted, open };
  }, [filtered, language, t]);

  const commercial = useMemo(() => {
    const lines = commercialLines.filter((line) => line.createdAt.slice(0, 10) >= range.from && line.createdAt.slice(0, 10) <= range.to);
    const items = new Map<string, { quantity: number; revenue: number }>();
    const units = new Map<string, number>();
    lines.forEach((line) => {
      const current = items.get(line.itemName) ?? { quantity: 0, revenue: 0 };
      items.set(line.itemName, { quantity: current.quantity + line.quantity, revenue: current.revenue + line.total });
      units.set(line.businessUnitName, (units.get(line.businessUnitName) ?? 0) + line.total);
    });
    return {
      products: Array.from(items.entries()).map(([name, values]) => ({ name, ...values })).sort((a, b) => b.revenue - a.revenue).slice(0, 6),
      units: Array.from(units.entries()).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue),
      total: lines.reduce((sum, line) => sum + line.total, 0),
    };
  }, [commercialLines, range]);

  const conversion = percentage(metrics.converted, filtered.length);
  const maxFunnel = Math.max(1, ...metrics.funnel.map((stage) => stage.value));
  const today = dateToInput(new Date());
  const upcoming = filtered.filter((reservation) => reservation.opportunityStatus === "OPEN" && reservation.status !== "CANCELLED" && reservation.checkIn.slice(0, 10) >= today).sort((a, b) => a.checkIn.localeCompare(b.checkIn)).slice(0, 4);
  const rangeText = `${new Date(`${range.from}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })} – ${new Date(`${range.to}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[#f6f7f9] px-6 py-7 sm:px-9">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-ink/10 pb-7">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md border border-ink/15 bg-white text-lg">▦</span><div><h1 className="font-display text-3xl font-extrabold text-ink">{t("dashboard.title")}</h1><p className="mt-1 text-sm text-ink/45">{t("dashboard.subtitle")}</p></div></div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex rounded-md border border-ink/15 bg-white p-1" aria-label={language === "es" ? "Medir periodo por" : "Measure period by"}>
              <button type="button" onClick={() => { setMeasure("reservation"); if (range.label === "next7") setRange(presetRange("last30")); }} className={`rounded px-3 py-2 text-xs font-bold ${measure === "reservation" ? "bg-ink text-white" : "text-ink/55"}`}>{language === "es" ? "Reserva creada" : "Reservation created"}</button>
              <button type="button" onClick={() => setMeasure("stay")} className={`rounded px-3 py-2 text-xs font-bold ${measure === "stay" ? "bg-ink text-white" : "text-ink/55"}`}>{language === "es" ? "Estancia" : "Stay"}</button>
            </div>
            <DateRangePicker range={range} measure={measure} onApply={setRange} />
          </div>
          <p className="w-full text-right text-xs font-semibold text-ink/45">{measure === "reservation" ? (language === "es" ? "Fecha de creación" : "Creation date") : (language === "es" ? "Estancias que se cruzan con" : "Stays overlapping")} · {rangeText}</p>
        </header>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_1.1fr_0.75fr]">
          <Panel title={t("dashboard.status")}><div className="flex min-h-72 flex-wrap items-center justify-center gap-8 p-6"><Donut slices={metrics.stageSlices} center={String(filtered.length)} /><div className="space-y-2">{metrics.stageSlices.map((slice) => <div key={slice.label} className="flex items-center gap-3 text-sm"><span className="h-3 w-6 rounded-sm" style={{ backgroundColor: slice.color }} /><span className="min-w-28 text-ink/60">{slice.label}</span><strong>{slice.value}</strong></div>)}</div></div></Panel>
          <Panel title={t("dashboard.channelOrigin")}><div className="min-h-72 p-5"><p className="mb-4 text-xs text-ink/45">{t("dashboard.channelHint")}</p><div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{metrics.channels.map((channel) => <div key={channel.id}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold"><span className="truncate text-ink/65">{channel.label}</span><span>{channel.percentage.toFixed(1)}% · {channel.count}</span></div><div className="flex items-center gap-3"><div className="h-2 min-w-0 flex-1 rounded-full bg-ink/5"><div className="h-full rounded-full" style={{ width: `${channel.percentage}%`, backgroundColor: channel.color }} /></div><span className="w-20 text-right text-[11px] text-ink/45">{money(channel.value)}</span></div></div>)}</div><div className="mt-7 flex justify-between border-t border-ink/10 pt-5 text-sm"><span className="text-ink/50">{t("dashboard.totalValue")}</span><strong>{money(metrics.totalValue)}</strong></div></div></Panel>
          <Panel title={t("dashboard.conversion")}><div className="grid min-h-72 place-items-center p-6 text-center"><div><Donut slices={[{ label: t("conversion.converted"), value: metrics.converted, color: chartColors[4] }, { label: t("conversion.remaining"), value: Math.max(0, filtered.length - metrics.converted), color: "#e8ebf1" }]} center={`${conversion.toFixed(1)}%`} /><p className="mt-5 text-xs text-ink/45">{t("dashboard.paidRevenue")}</p><p className="mt-1 text-lg font-bold">{money(metrics.paidValue)}</p></div></div></Panel>
        </div>

        <div className="mt-4"><ReservationHistory reservations={filtered} range={range} measure={measure} /></div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <Panel title={t("dashboard.funnel")}><div className="min-h-96 p-6"><div className="space-y-3">{metrics.funnel.map((stage, index) => { const previous = index === 0 ? stage.value : metrics.funnel[index - 1].value; return <div key={stage.label} className="grid grid-cols-[minmax(150px,1fr)_100px] items-center gap-5"><div className="relative h-14 overflow-hidden rounded-md bg-ink/5"><div className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${Math.max(4, percentage(stage.value, maxFunnel))}%`, backgroundColor: stage.color }} /><div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-bold"><span>{stage.label}</span><span>{stage.value}</span></div></div><div className="text-right"><p className="text-xs text-ink/40">{t("dashboard.nextStep")}</p><p className="mt-1 text-sm font-bold">{index === 0 ? "100.0%" : `${percentage(stage.value, previous).toFixed(1)}%`}</p></div></div>; })}</div></div></Panel>
          <Panel title={t("dashboard.propertyDistribution")}><div className="flex min-h-96 flex-wrap items-center justify-center gap-9 p-7"><Donut slices={metrics.propertySlices} center={String(filtered.length)} /><div className="space-y-4">{metrics.propertySlices.map((slice) => <div key={slice.label} className="flex min-w-52 items-start gap-3 text-sm"><span className="mt-1 h-3 w-6 rounded-sm" style={{ backgroundColor: slice.color }} /><span className="flex-1 text-ink/60">{slice.label}</span><span className="font-bold">{percentage(slice.value, filtered.length).toFixed(1)}% · {slice.value}</span></div>)}</div></div></Panel>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <Panel title={language === "es" ? "Productos y servicios más vendidos" : "Best-selling products and services"}><div className="divide-y divide-ink/10">{commercial.products.map((product, index) => <div key={product.name} className="grid grid-cols-[34px_minmax(0,1fr)_90px_120px] items-center gap-3 px-5 py-4 text-sm"><span className="grid h-7 w-7 place-items-center rounded-md bg-ink/5 text-xs font-bold">{index + 1}</span><strong className="truncate">{product.name}</strong><span className="text-right text-ink/45">{product.quantity.toFixed(product.quantity % 1 ? 1 : 0)} uds.</span><strong className="text-right">{money(product.revenue)}</strong></div>)}{!commercial.products.length && <p className="px-5 py-10 text-center text-sm text-ink/40">Sin ventas en este periodo.</p>}</div></Panel>
          <Panel title={language === "es" ? "Ingresos por unidad de negocio" : "Revenue by business unit"}><div className="p-5"><div className="space-y-5">{commercial.units.map((unit, index) => <div key={unit.name}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-semibold">{unit.name}</span><strong>{money(unit.revenue)} · {percentage(unit.revenue, commercial.total).toFixed(1)}%</strong></div><div className="h-3 overflow-hidden rounded-full bg-ink/5"><div className="h-full rounded-full" style={{ width: `${percentage(unit.revenue, commercial.total)}%`, backgroundColor: chartColors[index % chartColors.length] }} /></div></div>)}</div><div className="mt-6 flex justify-between border-t border-ink/10 pt-4 text-sm"><span className="text-ink/45">Ingresos comerciales</span><strong>{money(commercial.total)}</strong></div></div></Panel>
        </div>

        <div className="mt-4 grid gap-4 pb-8 xl:grid-cols-2">
          <Panel title={t("dashboard.upcoming")}><div className="divide-y divide-ink/10">{upcoming.map((reservation) => <div key={reservation.id} className="flex items-center justify-between gap-5 px-5 py-4 text-sm"><div className="min-w-0"><p className="truncate font-bold">{reservation.guestName}</p><p className="mt-1 truncate text-ink/45">{reservation.propertyName}</p></div><span className="shrink-0 text-xs text-ink/50">{new Date(reservation.checkIn).toLocaleDateString(locale, { day: "numeric", month: "short" })}</span></div>)}{!upcoming.length && <p className="px-5 py-10 text-center text-sm text-ink/40">{t("dashboard.noUpcoming")}</p>}</div></Panel>
          <Panel title={t("dashboard.actions")}><div className="grid min-h-52 place-items-center p-7 text-center"><div><p className="text-sm font-bold">{metrics.open} {t("dashboard.needsAttention")}</p><p className="mt-2 text-sm text-ink/45">{t("dashboard.actionsHint")}</p><a href="/dashboard/reservas" className="mt-5 inline-flex rounded-md bg-ink px-4 py-3 text-sm font-bold text-white">{t("dashboard.openReservations")}</a></div></div></Panel>
        </div>
      </div>
    </main>
  );
}
