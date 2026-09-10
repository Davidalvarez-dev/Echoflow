"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useLanguage } from "@/app/language-provider";
import {
  PIPELINE_STAGES,
  STAGE_COLORS,
  STAGE_LABELS,
  type OpportunityStatus,
  type PipelineStage,
} from "@/lib/pipeline";
import { updateOpportunityStatus, updateReservationStage } from "./actions";
import { ContactWorkspace, type CatalogItemOption, type QuoteItem } from "./contact-workspace";

export type OpportunityStage = PipelineStage;

export type OpportunitySeed = {
  id: string;
  guestName: string;
  propertyName: string;
  value: number;
  channel: string;
  checkIn: string;
  checkOut?: string;
  stage: OpportunityStage;
  opportunityStatus: OpportunityStatus;
  lostReason?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  guestCount?: number;
  paidAmount?: number;
  reservationNotes?: string | null;
  propertyUnit?: string | null;
  currency?: string;
  hasQuote?: boolean;
  adults?: number;
  children?: number;
  infants?: number;
  pets?: number;
  quoteItems?: QuoteItem[];
  taskCount?: number;
  noteCount?: number;
  appointmentCount?: number;
  quoteId?: string;
  quoteNumber?: string;
  quoteStatus?: string;
};

type Opportunity = OpportunitySeed & {
  notes?: number;
  tasks?: number;
};

type WorkspaceOpenMode = "details" | "opportunity" | "tasks" | "notes" | "appointments" | "payments";

const OPPORTUNITY_MIME = "application/x-hostflow-opportunity";

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function OpportunityCard({
  opportunity,
  onDragStart,
  onDragEnd,
  onOpen,
  onStatusChange,
  onRemove,
}: {
  opportunity: Opportunity;
  onDragStart: (event: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onOpen: (mode?: WorkspaceOpenMode) => void;
  onStatusChange: (status: OpportunityStatus) => void;
  onRemove: () => void;
}) {
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const statusLabels: Record<OpportunityStatus, string> = language === "es"
    ? { OPEN: "Abierta", WON: "Ganada", LOST: "Perdida", ABANDONED: "Abandonada" }
    : { OPEN: "Open", WON: "Won", LOST: "Lost", ABANDONED: "Abandoned" };

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-opportunity-id={opportunity.id}
      className="relative cursor-grab rounded-md border border-ink/10 bg-white p-4 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpen("opportunity")}
            className="block max-w-full truncate text-left text-sm font-bold text-ink hover:underline"
          >
            {opportunity.guestName}
          </button>
          <p className="mt-1 truncate text-xs text-ink/45">{opportunity.propertyName}</p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((current) => !current);
          }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-lg text-ink/45 hover:bg-ink/5"
          aria-label={`Opportunity actions for ${opportunity.guestName}`}
          aria-expanded={menuOpen}
        >
          ···
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
        <span className="rounded bg-ink/5 px-2 py-1 font-semibold text-ink/45">{opportunity.channel}</span>
        <strong className="text-ink">{money(opportunity.value)}</strong>
      </div>
      {opportunity.opportunityStatus !== "OPEN" && <span className={`mt-2 inline-flex w-fit rounded px-2 py-1 text-[10px] font-bold uppercase ${opportunity.opportunityStatus === "WON" ? "bg-emerald-50 text-emerald-700" : opportunity.opportunityStatus === "LOST" ? "bg-red-50 text-red-700" : "bg-ink/10 text-ink/60"}`}>{statusLabels[opportunity.opportunityStatus]}</span>}
      <div className="mt-4 flex items-center justify-between gap-1 border-t border-ink/10 pt-3 text-sm text-ink/55">
        {opportunity.phone ? <a href={`tel:${opportunity.phone}`} className="grid h-7 w-7 place-items-center rounded-md hover:bg-ink/5" title="Call guest" aria-label={`Call ${opportunity.guestName}`}>☎</a> : <span className="grid h-7 w-7 place-items-center opacity-30" title="No phone number">☎</span>}
        {!opportunity.id.startsWith("opportunity-") ? (
          <a href={`/dashboard/inbox?reservation=${encodeURIComponent(opportunity.id)}`} className="grid h-7 w-7 place-items-center rounded-md hover:bg-ink/5" title="Open conversation" aria-label={`Open conversation with ${opportunity.guestName}`}>◎</a>
        ) : (
          <span className="grid h-7 w-7 place-items-center opacity-30" title="No conversation yet">◎</span>
        )}
        <button type="button" onClick={() => onOpen("details")} className="relative grid h-7 w-7 place-items-center rounded-md hover:bg-ink/5" title="Contact tags" aria-label="Open contact details">◇<span className="absolute -right-1 -top-1 rounded-full bg-[#2468ec] px-1 text-[9px] font-bold text-white">1</span></button>
        <button type="button" onClick={() => onOpen("payments")} className="grid h-7 w-7 place-items-center rounded-md hover:bg-ink/5" title="Quote and documents" aria-label="Open quote breakdown">▧</button>
        <button type="button" onClick={() => onOpen("tasks")} className="relative grid h-7 w-7 place-items-center rounded-md hover:bg-ink/5" title="Tasks" aria-label="Open tasks">☑{Boolean(opportunity.taskCount) && <span className="absolute -right-1 -top-1 rounded-full bg-[#2468ec] px-1 text-[9px] font-bold text-white">{opportunity.taskCount}</span>}</button>
        <button type="button" onClick={() => onOpen("appointments")} className="relative grid h-7 w-7 place-items-center rounded-md hover:bg-ink/5" title="Appointments" aria-label="Open appointments">▣{Boolean(opportunity.appointmentCount) && <span className="absolute -right-1 -top-1 rounded-full bg-[#2468ec] px-1 text-[9px] font-bold text-white">{opportunity.appointmentCount}</span>}</button>
      </div>
      {menuOpen && (
        <div className="absolute right-3 top-11 z-20 w-44 rounded-md border border-ink/10 bg-white p-1 shadow-xl">
          <button type="button" onClick={() => { onStatusChange("WON"); setMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
            {language === "es" ? "Marcar ganada" : "Mark won"}
          </button>
          <button type="button" onClick={() => { onStatusChange("LOST"); setMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-ink/5">
            {language === "es" ? "Marcar perdida" : "Mark lost"}
          </button>
          <button type="button" onClick={() => { onStatusChange("ABANDONED"); setMenuOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-ink/5">
            {language === "es" ? "Marcar abandonada" : "Mark abandoned"}
          </button>
          <div className="my-1 border-t border-ink/10" />
          <button type="button" onClick={onRemove} className="w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50">
            {language === "es" ? "Eliminar oportunidad" : "Delete opportunity"}
          </button>
        </div>
      )}
    </article>
  );
}

function AddOpportunityModal({
  properties,
  stages,
  close,
  add,
}: {
  properties: string[];
  stages: { id: OpportunityStage; label: string; color: string }[];
  close: () => void;
  add: (opportunity: Opportunity) => void;
}) {
  const [guestName, setGuestName] = useState("");
  const [propertyName, setPropertyName] = useState(properties[0] ?? "General inquiry");
  const [stage, setStage] = useState<OpportunityStage>("INQUIRY");
  const [value, setValue] = useState("0");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!guestName.trim()) return;
    add({
      id: `opportunity-${Date.now()}`,
      guestName: guestName.trim(),
      propertyName,
      stage,
      value: Number(value) || 0,
      channel: "DIRECT",
      opportunityStatus: "OPEN",
      checkIn: new Date().toISOString(),
      notes: 0,
      tasks: 0,
    });
  }

  const inputClass = "mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm outline-none focus:border-ink";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-5" onMouseDown={close}>
      <section className="w-full max-w-lg rounded-md bg-white p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()} aria-label="Add opportunity">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold text-ink">Add opportunity</h2>
          <button type="button" onClick={close} className="grid h-8 w-8 place-items-center rounded-md text-xl hover:bg-ink/5" aria-label="Close add opportunity">×</button>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-bold text-ink">
            Guest name
            <input value={guestName} onChange={(event) => setGuestName(event.target.value)} className={inputClass} autoFocus />
          </label>
          <label className="block text-sm font-bold text-ink">
            Rental
            <select value={propertyName} onChange={(event) => setPropertyName(event.target.value)} className={inputClass}>
              {properties.map((property) => <option key={property}>{property}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-ink">
              Stage
              <select value={stage} onChange={(event) => setStage(event.target.value as OpportunityStage)} className={inputClass}>
                {stages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-bold text-ink">
              Value
              <input value={value} onChange={(event) => setValue(event.target.value)} className={inputClass} inputMode="decimal" />
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-ink/10 pt-5">
            <button type="button" onClick={close} className="rounded-md border border-ink/15 px-5 py-3 text-sm font-bold">Cancel</button>
            <button type="submit" className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-white">Add opportunity</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function LossReasonModal({ opportunity, close, save }: { opportunity: Opportunity; close: () => void; save: (reason: string) => void }) {
  const [reason, setReason] = useState(opportunity.lostReason ?? "");
  const [customReason, setCustomReason] = useState("");
  const selectedReason = reason === "Otro" ? customReason : reason;
  const reasons = ["Precio o presupuesto", "Eligió otra opción", "Fechas no disponibles", "No respondió", "No cumple requisitos", "Otro"];
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/35 p-5" onMouseDown={close}>
      <section role="dialog" aria-modal="true" aria-labelledby="loss-reason-title" className="w-full max-w-md rounded-md bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="loss-reason-title" className="font-display text-2xl font-extrabold">Marcar como perdida</h2>
        <p className="mt-2 text-sm leading-6 text-ink/50">Registra por qué se perdió la oportunidad de {opportunity.guestName}. Este dato alimenta el reporte de pérdidas.</p>
        <label className="mt-5 block text-sm font-bold">Motivo<select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option value="">Seleccionar motivo</option>{reasons.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        {reason === "Otro" && <label className="mt-4 block text-sm font-bold">Especificar motivo<input value={customReason} onChange={(event) => setCustomReason(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" autoFocus /></label>}
        <div className="mt-6 flex justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" onClick={close} className="h-10 rounded-md border border-ink/15 px-4 text-sm font-bold">Cancelar</button><button type="button" disabled={!selectedReason.trim()} onClick={() => save(selectedReason.trim())} className="h-10 rounded-md bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-40">Guardar pérdida</button></div>
      </section>
    </div>
  );
}

export function OpportunitiesBoard({ seeds, catalogItems }: { seeds: OpportunitySeed[]; catalogItems: CatalogItemOption[] }) {
  const { language } = useLanguage();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(seeds);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("All channels");
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus>("OPEN");
  const [view, setView] = useState<"board" | "list">("board");
  const [sortDesc, setSortDesc] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedWorkspaceMode, setSelectedWorkspaceMode] = useState<WorkspaceOpenMode>("opportunity");
  const [storageReady, setStorageReady] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [lossTarget, setLossTarget] = useState<Opportunity | null>(null);
  const [, startStageTransition] = useTransition();
  const boardScrollRef = useRef<HTMLDivElement>(null);

  const stages = useMemo(() => PIPELINE_STAGES.map((id) => ({
    id,
    label: STAGE_LABELS[language][id],
    color: STAGE_COLORS[id],
  })), [language]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem("hostflow.opportunities");
      if (stored) {
        try {
          const saved = JSON.parse(stored) as Opportunity[];
          const retained = saved.filter((opportunity) => (
            opportunity.id.startsWith("opportunity-")
            || seeds.some((seed) => seed.id === opportunity.id)
          ));
          const savedIds = new Set(retained.map((opportunity) => opportunity.id));
          const merged = retained.map((opportunity) => {
            const seed = seeds.find((item) => item.id === opportunity.id);
            if (!seed) return opportunity;
            return {
              ...opportunity,
              ...seed,
              quoteItems: seed.quoteItems ?? opportunity.quoteItems,
              taskCount: opportunity.taskCount ?? seed.taskCount,
              noteCount: opportunity.noteCount ?? seed.noteCount,
              appointmentCount: opportunity.appointmentCount ?? seed.appointmentCount,
            };
          });
          setOpportunities([
            ...merged,
            ...seeds.filter((seed) => !savedIds.has(seed.id)),
          ]);
        } catch {
          window.localStorage.removeItem("hostflow.opportunities");
        }
      }
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [seeds]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem("hostflow.opportunities", JSON.stringify(opportunities));
  }, [opportunities, storageReady]);

  const channels = useMemo(() => ["All channels", ...Array.from(new Set(opportunities.map((item) => item.channel)))], [opportunities]);
  const properties = useMemo(() => Array.from(new Set(seeds.map((seed) => seed.propertyName))), [seeds]);
  const selectedOpportunity = opportunities.find((opportunity) => opportunity.id === selectedOpportunityId);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return opportunities
      .filter((opportunity) => channel === "All channels" || opportunity.channel === channel)
      .filter((opportunity) => opportunity.opportunityStatus === statusFilter)
      .filter((opportunity) => !normalized || `${opportunity.guestName} ${opportunity.propertyName}`.toLowerCase().includes(normalized))
      .sort((a, b) => sortDesc ? b.value - a.value : a.value - b.value);
  }, [channel, opportunities, query, sortDesc, statusFilter]);

  function moveOpportunity(id: string, stage: OpportunityStage) {
    const previousStage = opportunities.find((opportunity) => opportunity.id === id)?.stage;
    if (!previousStage || previousStage === stage) {
      setDraggingId(null);
      return;
    }
    setStageError(null);
    setOpportunities((current) => current.map((opportunity) => opportunity.id === id ? { ...opportunity, stage } : opportunity));
    setDraggingId(null);
    if (id.startsWith("opportunity-")) return;
    startStageTransition(async () => {
      try {
        await updateReservationStage(id, stage);
      } catch {
        setOpportunities((current) => current.map((opportunity) => opportunity.id === id ? { ...opportunity, stage: previousStage } : opportunity));
        setStageError(language === "es" ? "No se pudo guardar la etapa. Se restauró el valor anterior." : "The stage could not be saved. The previous value was restored.");
      }
    });
  }

  function removeOpportunity(id: string) {
    setOpportunities((current) => current.filter((opportunity) => opportunity.id !== id));
  }

  function changeStatus(opportunity: Opportunity, status: OpportunityStatus, lostReason?: string) {
    const previous = opportunity.opportunityStatus;
    setOpportunities((current) => current.map((item) => item.id === opportunity.id ? { ...item, opportunityStatus: status, lostReason: status === "LOST" ? lostReason : null } : item));
    if (opportunity.id.startsWith("opportunity-")) return;
    startStageTransition(async () => {
      try {
        await updateOpportunityStatus(opportunity.id, status, lostReason);
      } catch {
        setOpportunities((current) => current.map((item) => item.id === opportunity.id ? { ...item, opportunityStatus: previous, lostReason: opportunity.lostReason } : item));
        setStageError(language === "es" ? "No se pudo guardar el estado de la oportunidad." : "The opportunity status could not be saved.");
      }
    });
  }

  function autoScrollBoard(event: React.DragEvent<HTMLDivElement>) {
    if (!draggingId || !boardScrollRef.current) return;
    const board = boardScrollRef.current;
    const bounds = board.getBoundingClientRect();
    const edge = 110;
    if (event.clientX < bounds.left + edge) board.scrollLeft -= 24;
    if (event.clientX > bounds.right - edge) board.scrollLeft += 24;
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f5f6f8]">
      <header className="shrink-0 border-b border-ink/10 bg-white px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink">Opportunities</h1>
            <p className="mt-1 text-sm text-ink/45">Track every direct-booking conversation.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setView("board")} aria-pressed={view === "board"} className={`grid h-10 w-10 place-items-center rounded-md border ${view === "board" ? "border-ink bg-ink text-white" : "border-ink/15 bg-white"}`} aria-label="Board view">▦</button>
            <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"} className={`grid h-10 w-10 place-items-center rounded-md border ${view === "list" ? "border-ink bg-ink text-white" : "border-ink/15 bg-white"}`} aria-label="List view">☷</button>
            <button type="button" onClick={() => setAddOpen(true)} className="ml-2 rounded-md bg-[#2468ec] px-5 py-3 text-sm font-bold text-white">+ Add opportunity</button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <select className="h-11 rounded-md border border-ink/15 bg-white px-4 text-sm font-semibold" aria-label="Pipeline">
            <option>Direct booking pipeline</option>
          </select>
          <span className="rounded-full bg-[#e9f0ff] px-3 py-2 text-xs font-bold text-[#2468ec]">{opportunities.length} opportunities</span>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OpportunityStatus)} className="h-10 rounded-md border border-ink/15 bg-white px-3 text-sm font-semibold" aria-label="Opportunity status">
              <option value="OPEN">{language === "es" ? "Abiertas" : "Open"}</option><option value="WON">{language === "es" ? "Ganadas" : "Won"}</option><option value="LOST">{language === "es" ? "Perdidas" : "Lost"}</option><option value="ABANDONED">{language === "es" ? "Abandonadas" : "Abandoned"}</option>
            </select>
            <select value={channel} onChange={(event) => setChannel(event.target.value)} className="h-10 rounded-md border border-ink/15 bg-white px-3 text-sm" aria-label="Filter by channel">
              {channels.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button type="button" onClick={() => setSortDesc((current) => !current)} className="h-10 rounded-md border border-ink/15 bg-white px-4 text-sm font-bold">Sort {sortDesc ? "↓" : "↑"}</button>
            <label className="relative">
              <span className="sr-only">Search opportunities</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search opportunities" className="h-10 w-64 rounded-md border border-ink/15 bg-white px-4 pr-10 text-sm outline-none focus:border-ink" />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/45">⌕</span>
            </label>
          </div>
        </div>
      </header>

      {stageError && (
        <div className="shrink-0 border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-800" role="alert">
          {stageError}
        </div>
      )}

      {view === "board" ? (
        <div ref={boardScrollRef} onDragOver={autoScrollBoard} className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-5">
          <div className="flex h-full min-w-max gap-3">
            {stages.map((stage) => {
              const stageItems = filtered.filter((opportunity) => opportunity.stage === stage.id);
              const stageValue = stageItems.reduce((sum, opportunity) => sum + opportunity.value, 0);
              return (
                <section
                  key={stage.id}
                  data-stage={stage.id}
                  onDragOver={(event) => {
                    if (event.dataTransfer.types.includes(OPPORTUNITY_MIME)) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    const id = event.dataTransfer.getData(OPPORTUNITY_MIME);
                    if (id) {
                      event.preventDefault();
                      moveOpportunity(id, stage.id);
                    }
                  }}
                  className={`flex h-full min-w-[250px] flex-1 flex-col overflow-hidden rounded-md border p-2 transition ${draggingId ? "border-dashed border-ink/25 bg-white/70" : "border-ink/10 bg-[#eef0f3]"}`}
                >
                  <header className="shrink-0 rounded-md bg-white px-3 py-3 shadow-sm" style={{ borderTop: `3px solid ${stage.color}` }}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-bold text-ink">{stage.label}</h2>
                      <span className="text-xs font-bold text-ink/45">{stageItems.length}</span>
                    </div>
                    <p className="mt-2 text-xs text-ink/45">{money(stageValue)}</p>
                  </header>
                  <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
                    {stageItems.map((opportunity) => (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData(OPPORTUNITY_MIME, opportunity.id);
                          setDraggingId(opportunity.id);
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        onOpen={(mode = "opportunity") => {
                          setSelectedWorkspaceMode(mode);
                          setSelectedOpportunityId(opportunity.id);
                        }}
                        onStatusChange={(status) => status === "LOST" ? setLossTarget(opportunity) : changeStatus(opportunity, status)}
                        onRemove={() => removeOpportunity(opportunity.id)}
                      />
                    ))}
                    {stageItems.length === 0 && (
                      <div className="grid min-h-24 place-items-center rounded-md border border-dashed border-ink/15 text-xs text-ink/35">Drop opportunity here</div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-5">
          <div className="min-w-[760px] overflow-hidden rounded-md border border-ink/10 bg-white">
            <div className="grid grid-cols-[1.2fr_1fr_150px_140px] border-b border-ink/10 px-5 py-3 text-xs font-bold uppercase text-ink/40">
              <span>Guest</span><span>Rental</span><span>Stage</span><span className="text-right">Value</span>
            </div>
            {filtered.map((opportunity) => (
              <div key={opportunity.id} className="grid grid-cols-[1.2fr_1fr_150px_140px] items-center border-b border-ink/10 px-5 py-4 text-sm last:border-b-0">
                <button type="button" onClick={() => { setSelectedWorkspaceMode("opportunity"); setSelectedOpportunityId(opportunity.id); }} className="truncate text-left font-bold hover:underline">{opportunity.guestName}</button>
                <span className="truncate text-ink/55">{opportunity.propertyName}</span>
                <span className="text-ink/55">{stages.find((stage) => stage.id === opportunity.stage)?.label}</span>
                <span className="text-right font-bold">{money(opportunity.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {addOpen && (
        <AddOpportunityModal
          properties={properties}
          stages={stages}
          close={() => setAddOpen(false)}
          add={(opportunity) => {
            setOpportunities((current) => [...current, opportunity]);
            setAddOpen(false);
          }}
        />
      )}

      {selectedOpportunity && (
        <ContactWorkspace
          key={selectedOpportunity.id}
          opportunity={selectedOpportunity}
          initialMode={selectedWorkspaceMode}
          onClose={() => setSelectedOpportunityId(null)}
          onUpdate={(updates) => {
            if (updates.stage && updates.stage !== selectedOpportunity.stage) {
              moveOpportunity(selectedOpportunity.id, updates.stage);
              return;
            }
            setOpportunities((current) => current.map((opportunity) => (
              opportunity.id === selectedOpportunity.id
                ? { ...opportunity, ...updates }
                : opportunity
            )));
          }}
          catalogItems={catalogItems}
          onDelete={() => {
            removeOpportunity(selectedOpportunity.id);
            setSelectedOpportunityId(null);
          }}
        />
      )}
      {lossTarget && <LossReasonModal opportunity={lossTarget} close={() => setLossTarget(null)} save={(reason) => { changeStatus(lossTarget, "LOST", reason); setLossTarget(null); }} />}
    </main>
  );
}
