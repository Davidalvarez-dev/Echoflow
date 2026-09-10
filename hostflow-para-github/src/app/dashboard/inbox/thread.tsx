"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  ContactWorkspace,
  getQuoteItems,
  quoteItemsTotal,
  type CatalogItemOption,
  type ContactOpportunity,
} from "../oportunidades/contact-workspace";
import { useLanguage } from "@/app/language-provider";
import { PIPELINE_STAGES, STAGE_LABELS, type PipelineStage } from "@/lib/pipeline";
import { updateReservationStage } from "../oportunidades/actions";
import { sendMessage } from "./actions";

type OpportunityStage = PipelineStage;
type WorkspaceOpenMode = "details" | "opportunity" | "tasks" | "notes" | "appointments" | "payments";

export type Conversation = {
  id: string;
  status: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  notes: string | null;
  opportunity: {
    value: number;
    paidAmount: number;
    channel: string;
    hasQuote: boolean;
    source: string | null;
    currency: string;
    adults: number;
    children: number;
    infants: number;
    pets: number;
    stage: OpportunityStage;
    quoteId?: string;
    quoteNumber?: string;
    quoteStatus?: string;
    quoteItems?: ContactOpportunity["quoteItems"];
  };
  guest: {
    name: string;
    email: string | null;
    phone: string | null;
    country: string | null;
    language: string | null;
  };
  property: { name: string; unit: string | null };
  messages: {
    id: string;
    author: string;
    body: string;
    createdAt: Date;
  }[];
};

const statusLabel: Record<string, string> = {
  CONFIRMED: "Reserved",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function toOpportunity(conversation: Conversation): ContactOpportunity {
  return {
    id: conversation.id,
    guestName: conversation.guest.name,
    propertyName: conversation.property.name,
    value: conversation.opportunity.value,
    paidAmount: conversation.opportunity.paidAmount,
    channel: conversation.opportunity.channel,
    checkIn: new Date(conversation.checkIn).toISOString(),
    checkOut: new Date(conversation.checkOut).toISOString(),
    stage: conversation.opportunity.stage,
    email: conversation.guest.email,
    phone: conversation.guest.phone,
    source: conversation.opportunity.source,
    guestCount: conversation.guestCount,
    reservationNotes: conversation.notes,
    propertyUnit: conversation.property.unit,
    currency: conversation.opportunity.currency,
    hasQuote: conversation.opportunity.hasQuote,
    adults: conversation.opportunity.adults,
    children: conversation.opportunity.children,
    infants: conversation.opportunity.infants,
    pets: conversation.opportunity.pets,
    quoteId: conversation.opportunity.quoteId,
    quoteNumber: conversation.opportunity.quoteNumber,
    quoteStatus: conversation.opportunity.quoteStatus,
    quoteItems: conversation.opportunity.quoteItems,
  };
}

function persistOpportunity(opportunity: ContactOpportunity) {
  const raw = window.localStorage.getItem("hostflow.opportunities");
  let saved: ContactOpportunity[] = [];

  if (raw) {
    try {
      saved = JSON.parse(raw) as ContactOpportunity[];
    } catch {
      window.localStorage.removeItem("hostflow.opportunities");
    }
  }

  const index = saved.findIndex((item) => item.id === opportunity.id);
  if (index >= 0) {
    saved[index] = { ...saved[index], ...opportunity };
  } else {
    saved.push(opportunity);
  }
  window.localStorage.setItem("hostflow.opportunities", JSON.stringify(saved));
}

export function InboxThread({
  conversations,
  initialConversationId,
  catalogItems,
}: {
  conversations: Conversation[];
  initialConversationId?: string;
  catalogItems: CatalogItemOption[];
}) {
  const { language } = useLanguage();
  const stageOptions = PIPELINE_STAGES.map((id) => ({
    id,
    label: STAGE_LABELS[language][id],
  }));
  const validInitialId = conversations.some((conversation) => conversation.id === initialConversationId)
    ? initialConversationId
    : conversations[0]?.id;
  const [selectedId, setSelectedId] = useState(validInitialId ?? null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceOpenMode>("opportunity");
  const [opportunities, setOpportunities] = useState<Record<string, ContactOpportunity>>(() => (
    Object.fromEntries(conversations.map((conversation) => [conversation.id, toOpportunity(conversation)]))
  ));
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const selectedOpportunity = selected ? opportunities[selected.id] ?? toOpportunity(selected) : null;
  const [pending, startTransition] = useTransition();
  const [stagePending, startStageTransition] = useTransition();
  const [stageError, setStageError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const raw = window.localStorage.getItem("hostflow.opportunities");
      if (!raw) return;
      try {
        const saved = JSON.parse(raw) as ContactOpportunity[];
        setOpportunities((current) => {
          const next = { ...current };
          saved.forEach((opportunity) => {
            if (next[opportunity.id]) {
              const canonical = next[opportunity.id];
              next[opportunity.id] = {
                ...opportunity,
                ...canonical,
                quoteItems: canonical.quoteItems ?? opportunity.quoteItems,
                taskCount: opportunity.taskCount ?? canonical.taskCount,
                noteCount: opportunity.noteCount ?? canonical.noteCount,
                appointmentCount: opportunity.appointmentCount ?? canonical.appointmentCount,
              };
            }
          });
          return next;
        });
      } catch {
        window.localStorage.removeItem("hostflow.opportunities");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!selected || !selectedOpportunity) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-hidden p-10 text-sm text-ink/50">
        No conversations yet.
      </div>
    );
  }

  const quoteItems = getQuoteItems(selectedOpportunity);
  const quoteTotal = quoteItemsTotal(quoteItems);
  const stayNights = Math.max(
    1,
    Math.round((new Date(selected.checkOut).getTime() - new Date(selected.checkIn).getTime()) / 86_400_000),
  );

  function handleSend(formData: FormData) {
    startTransition(async () => {
      await sendMessage(formData);
      formRef.current?.reset();
    });
  }

  function selectConversation(id: string) {
    setSelectedId(id);
    setWorkspaceOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("reservation", id);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  function updateOpportunity(updates: Partial<ContactOpportunity>) {
    if (!selectedOpportunity) return;
    const previousStage = selectedOpportunity.stage;
    const next: ContactOpportunity = { ...selectedOpportunity, ...updates };
    setOpportunities((current) => ({ ...current, [selected.id]: next }));
    persistOpportunity(next);
    if (updates.stage && updates.stage !== previousStage) {
      setStageError(null);
      startStageTransition(async () => {
        try {
          await updateReservationStage(selected.id, updates.stage as PipelineStage);
        } catch {
          const restored = { ...next, stage: previousStage };
          setOpportunities((current) => ({ ...current, [selected.id]: restored }));
          persistOpportunity(restored);
          setStageError(language === "es" ? "No se pudo guardar la etapa." : "The stage could not be saved.");
        }
      });
    }
  }

  function openWorkspace(mode: WorkspaceOpenMode) {
    setWorkspaceMode(mode);
    setWorkspaceOpen(true);
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#f5f6f8]">
      <aside className="flex min-h-0 w-[280px] shrink-0 flex-col border-r border-ink/10 bg-white max-md:hidden">
        <div className="shrink-0 border-b border-ink/10 px-5 py-4">
          <h1 className="font-display text-xl font-extrabold text-ink">Inbox</h1>
          <p className="mt-1 text-xs text-ink/45">{conversations.length} conversations</p>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {conversations.map((conversation) => {
            const last = conversation.messages[conversation.messages.length - 1];
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  className={`block w-full border-b border-ink/5 px-5 py-4 text-left transition ${conversation.id === selected.id ? "bg-coral/20" : "hover:bg-ink/5"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-bold text-ink">{conversation.guest.name}</p>
                    {last && <span className="shrink-0 text-[11px] text-ink/40">{formatDate(last.createdAt)}</span>}
                  </div>
                  <p className="mt-1 truncate text-xs text-ink/50">{last ? last.body : "No messages"}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-ink px-2 py-0.5 text-[10px] font-bold uppercase text-white">{statusLabel[conversation.status] ?? conversation.status}</span>
                    <span className="truncate text-[11px] text-ink/40">{conversation.property.name}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-[#f7f8fb]">
        <header className="shrink-0 border-b border-ink/10 bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dce9ff] text-xs font-bold text-[#2468ec]">
              {selected.guest.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink">{selected.guest.name}</p>
              <p className="truncate text-xs text-ink/45">{selected.property.name}{selected.property.unit ? ` · ${selected.property.unit}` : ""}</p>
            </div>
            <a href="/dashboard/oportunidades" className="hidden rounded-md border border-ink/15 px-3 py-2 text-xs font-bold hover:bg-ink/5 sm:block">Pipeline</a>
            <button type="button" onClick={() => openWorkspace("details")} className="rounded-md bg-ink px-3 py-2 text-xs font-bold text-white">CRM</button>
          </div>
          <select value={selected.id} onChange={(event) => selectConversation(event.target.value)} className="mt-3 h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm md:hidden" aria-label="Select conversation">
            {conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.guest.name}</option>)}
          </select>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
          {selected.messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center"><div><p className="font-bold text-ink/55">No messages yet</p><p className="mt-2 text-sm text-ink/40">Start the conversation below.</p></div></div>
          ) : (
            selected.messages.map((message) => {
              if (message.author === "SYSTEM") {
                return <div key={message.id} className="text-center text-xs text-ink/40">{message.body} · {formatTime(message.createdAt)}</div>;
              }
              const isHost = message.author === "HOST";
              return (
                <div key={message.id} className={`flex ${isHost ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-md px-4 py-3 text-sm shadow-sm ${isHost ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink"}`}>
                    <p className="whitespace-pre-wrap leading-5">{message.body}</p>
                    <p className={`mt-1 text-[10px] ${isHost ? "text-white/50" : "text-ink/40"}`}>{formatTime(message.createdAt)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form ref={formRef} action={handleSend} className="shrink-0 flex items-center gap-3 border-t border-ink/10 bg-white p-4">
          <input type="hidden" name="reservationId" value={selected.id} />
          <input name="body" placeholder="Type a message" required className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-ink" />
          <button type="submit" disabled={pending} className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#2468ec] font-bold text-white disabled:opacity-50" aria-label="Send message">→</button>
        </form>
      </section>

      <aside className="hidden min-h-0 w-[320px] shrink-0 flex-col border-l border-ink/10 bg-[#f5f6f8] xl:flex">
        <div className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4">
          <div><h2 className="font-bold text-ink">Opportunity</h2><p className="mt-1 text-xs text-ink/45">Linked to this conversation</p></div>
          <button type="button" onClick={() => openWorkspace("opportunity")} className="rounded-md px-3 py-2 text-xs font-bold hover:bg-ink/5">Open</button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <section className="rounded-md border border-ink/10 bg-white p-4">
            <p className="truncate text-sm font-bold">Direct booking pipeline</p>
            <p className="mt-1 truncate text-xs text-ink/45">{selected.property.name}</p>
            <label className="mt-5 block text-xs font-bold text-ink/45">Stage
              <select disabled={stagePending} value={selectedOpportunity.stage} onChange={(event) => updateOpportunity({ stage: event.target.value as OpportunityStage })} className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-ink/5 px-3 text-sm font-bold disabled:opacity-60">
                {stageOptions.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
              </select>
            </label>
            {stageError && <p className="mt-2 text-xs font-semibold text-red-700" role="alert">{stageError}</p>}
            <div className="mt-4 flex items-end justify-between gap-3">
              <div><p className="text-[11px] font-bold uppercase text-ink/35">Opportunity value</p><p className="mt-1 text-xl font-bold">{money(quoteTotal)}</p></div>
              <span className="rounded bg-ink/5 px-2 py-1 text-[11px] font-bold text-ink/50">{selectedOpportunity.hasQuote ? "Quoted" : "Estimated"}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/10 pt-4">
              <div><p className="text-[11px] font-bold uppercase text-ink/35">Paid</p><p className="mt-1 text-sm font-bold">{money(selectedOpportunity.paidAmount ?? 0)}</p></div>
              <div><p className="text-[11px] font-bold uppercase text-ink/35">Pending</p><p className="mt-1 text-sm font-bold">{money(Math.max(0, quoteTotal - (selectedOpportunity.paidAmount ?? 0)))}</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4 text-xs"><strong>Open</strong><span className="rounded bg-ink/5 px-2 py-1 font-bold text-ink/50">{selectedOpportunity.channel}</span></div>
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Reservation</h3><button type="button" onClick={() => openWorkspace("opportunity")} className="text-xs font-bold text-[#2468ec]">View</button></div>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-xs text-ink/40">Rental</dt><dd className="mt-1 font-semibold">{selected.property.name}{selected.property.unit ? ` · ${selected.property.unit}` : ""}</dd></div>
              <div className="grid grid-cols-2 gap-3">
                <div><dt className="text-xs text-ink/40">Check-in</dt><dd className="mt-1 font-semibold">{formatDate(selected.checkIn)}</dd></div>
                <div><dt className="text-xs text-ink/40">Check-out</dt><dd className="mt-1 font-semibold">{formatDate(selected.checkOut)}</dd></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><dt className="text-xs text-ink/40">Stay</dt><dd className="mt-1 font-semibold">{stayNights} {stayNights === 1 ? "night" : "nights"}</dd></div>
                <div><dt className="text-xs text-ink/40">Guests</dt><dd className="mt-1 font-semibold">{selected.guestCount}</dd></div>
              </div>
              <div><dt className="text-xs text-ink/40">Guest mix</dt><dd className="mt-1 leading-5 text-ink/65">{selectedOpportunity.adults ?? selected.guestCount} adults · {selectedOpportunity.children ?? 0} children · {selectedOpportunity.infants ?? 0} infants · {selectedOpportunity.pets ?? 0} pets</dd></div>
            </dl>
          </section>

          <section className="rounded-md border border-ink/10 bg-white">
            <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3"><div><h3 className="text-sm font-bold">Cotización</h3><p className="mt-0.5 text-[10px] font-semibold uppercase text-ink/35">{selectedOpportunity.quoteNumber ?? "Borrador de oportunidad"}{selectedOpportunity.quoteStatus ? ` · ${selectedOpportunity.quoteStatus}` : ""}</p></div><button type="button" onClick={() => openWorkspace("payments")} className="rounded-md bg-[#e9f0ff] px-2.5 py-2 text-xs font-bold text-[#2468ec]">Editar aquí</button></div>
            <div className="divide-y divide-ink/10">
              {quoteItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0"><p className="truncate font-semibold">{item.name}</p><p className="mt-1 text-[11px] text-ink/40">{item.quantity} × {money(item.unitPrice)}</p></div>
                  <strong>{money(item.lineTotal ?? item.quantity * item.unitPrice)}</strong>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm"><strong>Total</strong><strong>{money(quoteTotal)}</strong></div>
          </section>

          <section className="rounded-md border border-ink/10 bg-white p-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Contact</h3><button type="button" onClick={() => openWorkspace("details")} className="text-xs font-bold text-[#2468ec]">Details</button></div>
            <dl className="mt-4 space-y-3 text-sm">
              {selected.guest.email && <div><dt className="text-xs text-ink/40">Email</dt><dd className="mt-1 truncate">{selected.guest.email}</dd></div>}
              {selected.guest.phone && <div><dt className="text-xs text-ink/40">Phone</dt><dd className="mt-1">{selected.guest.phone}</dd></div>}
              {selected.guest.language && <div><dt className="text-xs text-ink/40">Language</dt><dd className="mt-1">{selected.guest.language}</dd></div>}
            </dl>
          </section>
        </div>
      </aside>

      {workspaceOpen && (
        <ContactWorkspace
          key={selectedOpportunity.id}
          opportunity={selectedOpportunity}
          initialMode={workspaceMode}
          onClose={() => setWorkspaceOpen(false)}
          onUpdate={updateOpportunity}
          catalogItems={catalogItems}
        />
      )}
    </div>
  );
}
