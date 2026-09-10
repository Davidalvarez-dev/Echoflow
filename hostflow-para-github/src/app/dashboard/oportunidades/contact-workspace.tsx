"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useLanguage } from "@/app/language-provider";
import { PIPELINE_STAGES, STAGE_LABELS, type PipelineStage } from "@/lib/pipeline";
import {
  addOpportunityQuoteLine,
  removeOpportunityQuoteLine,
  updateOpportunityQuoteLine,
} from "../ventas/actions";
import { recordReservationPayment, sendOpportunityQuote } from "./actions";

type Stage = PipelineStage;

export type QuoteItem = {
  id: string;
  name: string;
  category: "stay" | "fee" | "tax" | "product" | "discount";
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  categoryLabel?: string;
  businessUnit?: string;
};

export type CatalogItemOption = {
  id: string;
  name: string;
  price: number;
  unit: string;
  businessUnit: string;
  category: string;
};

export type ContactOpportunity = {
  id: string;
  guestName: string;
  propertyName: string;
  value: number;
  paidAmount?: number;
  channel: string;
  checkIn: string;
  checkOut?: string;
  stage: Stage;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  guestCount?: number;
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

type WorkspaceMode =
  | "details"
  | "opportunity"
  | "tasks"
  | "notes"
  | "appointments"
  | "payments";

type TaskItem = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
};

type AppointmentItem = {
  id: string;
  title: string;
  startsAt: string;
};

type TransactionItem = {
  id: string;
  date: string;
  amount: number;
  status: "Pending" | "Paid" | "Refunded";
};

type ContactRecord = {
  owner: string;
  tags: string[];
  contactType: string;
  email: string;
  phone: string;
  source: string;
  note: string;
  tasks: TaskItem[];
  appointments: AppointmentItem[];
  transactions: TransactionItem[];
};

type IconName = "contact" | "opportunity" | "task" | "note" | "calendar" | "payment";

const railItems: { id: WorkspaceMode; label: string; icon: IconName }[] = [
  { id: "details", label: "Contact details", icon: "contact" },
  { id: "opportunity", label: "Opportunities", icon: "opportunity" },
  { id: "tasks", label: "Tasks", icon: "task" },
  { id: "notes", label: "Notes", icon: "note" },
  { id: "appointments", label: "Appointments", icon: "calendar" },
  { id: "payments", label: "Payments", icon: "payment" },
];

function WorkspaceIcon({ name }: { name: IconName }) {
  const props = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "contact":
      return <svg {...props}><circle cx="12" cy="8" r="3" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>;
    case "opportunity":
      return <svg {...props}><path d="M4 6h5v5H4zM15 4h5v5h-5zM10 15h5v5h-5zM9 8h6M17 9v3l-4 3" /></svg>;
    case "task":
      return <svg {...props}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M8.5 12l2 2 5-5" /></svg>;
    case "note":
      return <svg {...props}><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM14 7l3 3" /></svg>;
    case "calendar":
      return <svg {...props}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M8 3v4M16 3v4M3.5 9h17" /></svg>;
    case "payment":
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M15 8.5h-4.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H9M12 6v12" /></svg>;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getQuoteItems(opportunity: ContactOpportunity): QuoteItem[] {
  if (opportunity.quoteItems?.length) return opportunity.quoteItems;
  const accommodation = opportunity.value * 0.75;
  const cleaning = opportunity.value * 0.1;
  const taxes = opportunity.value - accommodation - cleaning;
  return [
    { id: "accommodation", name: opportunity.propertyName, category: "stay", quantity: 1, unitPrice: accommodation },
    { id: "cleaning", name: "Cleaning fee", category: "fee", quantity: 1, unitPrice: cleaning },
    { id: "taxes", name: "Taxes", category: "tax", quantity: 1, unitPrice: taxes },
  ];
}

export function quoteItemsTotal(items: QuoteItem[]) {
  return items.reduce((total, item) => total + (item.lineTotal ?? item.quantity * item.unitPrice), 0);
}

function readableDate(value: string) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function nights(checkIn: string, checkOut?: string) {
  if (!checkOut) return 1;
  return Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000));
}

function emptyRecord(opportunity: ContactOpportunity): ContactRecord {
  const transactions: TransactionItem[] = opportunity.paidAmount
    ? [{
        id: `initial-${opportunity.id}`,
        date: opportunity.checkIn,
        amount: opportunity.paidAmount,
        status: "Paid",
      }]
    : [];

  return {
    owner: "Unassigned",
    tags: ["active"],
    contactType: "Lead",
    email: opportunity.email ?? "",
    phone: opportunity.phone ?? "",
    source: opportunity.source ?? opportunity.channel,
    note: opportunity.reservationNotes ?? "",
    tasks: [],
    appointments: [],
    transactions,
  };
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[330px] place-items-center px-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink/5 text-ink/55">+</div>
        <h3 className="mt-4 text-base font-bold text-ink/65">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/45">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

function ModuleHeader({
  title,
  addLabel,
  onAdd,
}: {
  title: string;
  addLabel?: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {addLabel && onAdd && (
        <button type="button" onClick={onAdd} className="rounded-md px-3 py-2 text-sm font-bold text-ink hover:bg-ink/5">
          + {addLabel}
        </button>
      )}
    </div>
  );
}

export function ContactWorkspace({
  opportunity,
  initialMode = "details",
  onClose,
  onUpdate,
  onDelete,
  catalogItems = [],
}: {
  opportunity: ContactOpportunity;
  initialMode?: WorkspaceMode;
  onClose: () => void;
  onUpdate: (updates: Partial<ContactOpportunity>) => void;
  onDelete?: () => void;
  catalogItems?: CatalogItemOption[];
}) {
  const { language } = useLanguage();
  const stages = useMemo(() => PIPELINE_STAGES.map((id) => ({
    id,
    label: STAGE_LABELS[language][id],
  })), [language]);
  const [mode, setMode] = useState<WorkspaceMode>(initialMode);
  const [record, setRecord] = useState<ContactRecord>(() => emptyRecord(opportunity));
  const [storageReady, setStorageReady] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [search, setSearch] = useState("");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTab, setAppointmentTab] = useState<"upcoming" | "past">("upcoming");
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<TransactionItem["status"]>("Paid");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productItemId, setProductItemId] = useState("");
  const [productName, setProductName] = useState("");
  const [productQuantity, setProductQuantity] = useState("1");
  const [productPrice, setProductPrice] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotePending, startQuoteTransition] = useTransition();
  const [workspaceOpenedAt] = useState(() => Date.now());

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(`hostflow.contact.${opportunity.id}`);
      if (stored) {
        try {
          setRecord({ ...emptyRecord(opportunity), ...(JSON.parse(stored) as ContactRecord) });
        } catch {
          window.localStorage.removeItem(`hostflow.contact.${opportunity.id}`);
        }
      }
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [opportunity]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(`hostflow.contact.${opportunity.id}`, JSON.stringify(record));
  }, [opportunity.id, record, storageReady]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const filteredTasks = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return record.tasks.filter((task) => !normalized || task.title.toLowerCase().includes(normalized));
  }, [record.tasks, search]);

  const visibleAppointments = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return record.appointments.filter((appointment) => {
      const matchesTab = appointmentTab === "upcoming"
        ? new Date(appointment.startsAt).getTime() >= workspaceOpenedAt
        : new Date(appointment.startsAt).getTime() < workspaceOpenedAt;
      return matchesTab && (!normalized || appointment.title.toLowerCase().includes(normalized));
    });
  }, [appointmentTab, record.appointments, search, workspaceOpenedAt]);

  function changeMode(nextMode: WorkspaceMode) {
    setMode(nextMode);
    setSearch("");
    setTaskFormOpen(false);
    setAppointmentFormOpen(false);
    setPaymentFormOpen(false);
    setProductFormOpen(false);
  }

  function addTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = tagInput.trim();
    if (!value || record.tags.includes(value)) return;
    setRecord((current) => ({ ...current, tags: [...current.tags, value] }));
    setTagInput("");
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    const nextTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      dueDate: taskDueDate,
      completed: false,
    };
    setRecord((current) => ({
      ...current,
      tasks: [...current.tasks, nextTask],
    }));
    onUpdate({ taskCount: record.tasks.length + 1 });
    setTaskTitle("");
    setTaskDueDate("");
    setTaskFormOpen(false);
  }

  function addAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!appointmentTitle.trim() || !appointmentDate) return;
    const nextAppointment: AppointmentItem = {
      id: `appointment-${Date.now()}`,
      title: appointmentTitle.trim(),
      startsAt: appointmentDate,
    };
    setRecord((current) => ({
      ...current,
      appointments: [...current.appointments, nextAppointment],
    }));
    onUpdate({ appointmentCount: record.appointments.length + 1 });
    setAppointmentTitle("");
    setAppointmentDate("");
    setAppointmentFormOpen(false);
  }

  function addPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount < 0) return;
    const transaction: TransactionItem = {
      id: `transaction-${Date.now()}`,
      date: new Date().toISOString(),
      amount,
      status: paymentStatus,
    };
    setRecord((current) => ({
      ...current,
      transactions: [...current.transactions, transaction],
    }));
    if (!opportunity.id.startsWith("opportunity-")) {
      startQuoteTransition(async () => {
        try {
          const result = await recordReservationPayment(opportunity.id, amount, paymentStatus);
          onUpdate({ paidAmount: result.paidAmount, stage: paymentStatus === "Paid" ? "BOOKED" : opportunity.stage });
        } catch { setQuoteError("No se pudo registrar el pago."); }
      });
    } else if (paymentStatus === "Paid") {
      onUpdate({ paidAmount: (opportunity.paidAmount ?? 0) + amount });
    } else if (paymentStatus === "Refunded") {
      onUpdate({ paidAmount: Math.max(0, (opportunity.paidAmount ?? 0) - amount) });
    }
    setPaymentAmount("");
    setPaymentFormOpen(false);
  }

  function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = Math.max(1, Number(productQuantity) || 1);
    if (!opportunity.id.startsWith("opportunity-") && productItemId) {
      setQuoteError(null);
      startQuoteTransition(async () => {
        try {
          const snapshot = await addOpportunityQuoteLine(opportunity.id, productItemId, quantity);
          onUpdate({ quoteId: snapshot.quoteId, quoteNumber: snapshot.quoteNumber, quoteStatus: snapshot.quoteStatus, quoteItems: snapshot.items, value: snapshot.total, hasQuote: true });
          setProductItemId("");
          setProductQuantity("1");
          setProductFormOpen(false);
        } catch {
          setQuoteError("No se pudo agregar el concepto a la cotización.");
        }
      });
      return;
    }
    const unitPrice = Number(productPrice);
    if (!productName.trim() || !productPrice || unitPrice < 0) return;
    const items = [...getQuoteItems(opportunity), {
      id: `product-${Date.now()}`,
      name: productName.trim(),
      category: "product" as const,
      quantity,
      unitPrice,
    }];
    onUpdate({ quoteItems: items, value: quoteItemsTotal(items), hasQuote: true });
    setProductName("");
    setProductQuantity("1");
    setProductPrice("");
    setProductFormOpen(false);
  }

  function removeQuoteItem(id: string) {
    const item = getQuoteItems(opportunity).find((candidate) => candidate.id === id);
    if (!opportunity.id.startsWith("opportunity-") && item?.businessUnit) {
      setQuoteError(null);
      startQuoteTransition(async () => {
        try {
          const snapshot = await removeOpportunityQuoteLine(opportunity.id, id);
          onUpdate({ quoteId: snapshot.quoteId, quoteNumber: snapshot.quoteNumber, quoteStatus: snapshot.quoteStatus, quoteItems: snapshot.items, value: snapshot.total, hasQuote: true });
        } catch {
          setQuoteError("No se pudo eliminar el concepto.");
        }
      });
      return;
    }
    const items = getQuoteItems(opportunity).filter((item) => item.id !== id);
    onUpdate({ quoteItems: items, value: quoteItemsTotal(items) });
  }

  function changeQuoteItemQuantity(item: QuoteItem, quantity: number) {
    if (opportunity.id.startsWith("opportunity-") || !item.businessUnit) return;
    setQuoteError(null);
    startQuoteTransition(async () => {
      try {
        const snapshot = await updateOpportunityQuoteLine(opportunity.id, item.id, quantity);
        onUpdate({ quoteId: snapshot.quoteId, quoteNumber: snapshot.quoteNumber, quoteStatus: snapshot.quoteStatus, quoteItems: snapshot.items, value: snapshot.total, hasQuote: true });
      } catch {
        setQuoteError("No se pudo actualizar la cantidad.");
      }
    });
  }

  function sendQuote() {
    if (opportunity.id.startsWith("opportunity-")) return;
    setQuoteError(null);
    startQuoteTransition(async () => {
      try {
        const result = await sendOpportunityQuote(opportunity.id);
        onUpdate({ quoteStatus: result.quoteStatus, hasQuote: true, stage: "QUOTED" });
      } catch (error) {
        setQuoteError(error instanceof Error ? error.message : "No se pudo enviar la cotización.");
      }
    });
  }

  const inputClass = "h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm outline-none focus:border-ink";
  const modeTitle = railItems.find((item) => item.id === mode)?.label ?? "Contact details";
  const quoteItems = getQuoteItems(opportunity);
  const quoteTotal = quoteItemsTotal(quoteItems);
  const stayNights = nights(opportunity.checkIn, opportunity.checkOut);

  function quoteBreakdownPanel() {
    return (
      <section className="rounded-md border border-ink/10 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4"><div><h2 className="text-xl font-bold text-ink">Cotización</h2><p className="mt-1 text-xs font-semibold uppercase text-ink/35">{opportunity.quoteNumber ?? "Nueva cotización"}{opportunity.quoteStatus ? ` · ${opportunity.quoteStatus}` : ""}</p></div><div className="flex gap-2"><button type="button" onClick={sendQuote} disabled={quotePending || !quoteItems.length} className="rounded-md border border-[#2468ec]/30 px-3 py-2 text-sm font-bold text-[#2468ec] disabled:opacity-40">Enviar</button><button type="button" onClick={() => setProductFormOpen(true)} className="rounded-md bg-ink px-3 py-2 text-sm font-bold text-white">+ Concepto</button></div></div>
        {productFormOpen && (
          <form onSubmit={addProduct} className="grid gap-3 border-b border-ink/10 bg-ink/[0.02] p-4 sm:grid-cols-[1fr_80px_auto]">
            {opportunity.id.startsWith("opportunity-") ? <input value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="Producto o servicio" className={inputClass} autoFocus /> : <select required value={productItemId} onChange={(event) => setProductItemId(event.target.value)} className={inputClass} autoFocus><option value="">Selecciona del catálogo</option>{catalogItems.map((item) => <option key={item.id} value={item.id}>{item.businessUnit} · {item.name} · {money(item.price)}</option>)}</select>}
            <input value={productQuantity} onChange={(event) => setProductQuantity(event.target.value)} inputMode="numeric" aria-label="Quantity" className={inputClass} />
            {opportunity.id.startsWith("opportunity-") && <input value={productPrice} onChange={(event) => setProductPrice(event.target.value)} inputMode="decimal" placeholder="Precio" aria-label="Unit price" className={inputClass} />}
            <button type="submit" disabled={quotePending} className="rounded-md bg-ink px-4 py-3 text-sm font-bold text-white disabled:opacity-50">Agregar</button>
          </form>
        )}
        {quoteError && <p className="border-b border-red-200 bg-red-50 px-5 py-3 text-xs font-semibold text-red-700" role="alert">{quoteError}</p>}
        <div className="divide-y divide-ink/10">
          {quoteItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_58px_110px_30px] items-center gap-2 px-5 py-4 text-sm">
              <div className="min-w-0"><p className="truncate font-semibold text-ink">{item.name}</p><p className="mt-1 text-[11px] uppercase text-ink/35">{item.businessUnit ? `${item.businessUnit} · ` : ""}{item.categoryLabel ?? item.category}</p></div>
              {item.businessUnit ? <div className="flex items-center justify-center gap-1"><button type="button" disabled={quotePending || item.quantity <= 1} onClick={() => changeQuoteItemQuantity(item, Math.max(1, item.quantity - 1))} className="grid h-7 w-7 place-items-center rounded-md border border-ink/15 disabled:opacity-30">−</button><span className="w-7 text-center text-xs font-bold">{item.quantity}</span><button type="button" disabled={quotePending} onClick={() => changeQuoteItemQuantity(item, item.quantity + 1)} className="grid h-7 w-7 place-items-center rounded-md border border-ink/15 disabled:opacity-30">+</button></div> : <span className="text-center text-ink/50">× {item.quantity}</span>}
              <strong className="text-right">{money(item.lineTotal ?? item.quantity * item.unitPrice)}</strong>
              {item.category === "product" ? (
                <button type="button" onClick={() => removeQuoteItem(item.id)} className="grid h-7 w-7 place-items-center rounded-md text-ink/35 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${item.name}`}>×</button>
              ) : <span />}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-ink/10 bg-ink/[0.02] px-5 py-4"><strong>Total</strong><strong className="text-lg">{money(quoteTotal)}</strong></div>
      </section>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/15" onMouseDown={onClose}>
      <section
        className="flex h-full w-full max-w-[780px] flex-col border-l border-ink/10 bg-[#f5f6f8] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        aria-label={`${opportunity.guestName} contact workspace`}
        aria-modal="true"
        role="dialog"
      >
        <header className="flex shrink-0 items-center gap-4 border-b border-ink/10 bg-white px-4 py-4 sm:px-6">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#dce9ff] text-sm font-bold text-[#2468ec]">
            {initials(opportunity.guestName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-ink">{opportunity.guestName}</p>
            <p className="truncate text-sm text-ink/45">{opportunity.propertyName} · {modeTitle}</p>
          </div>
          {!opportunity.id.startsWith("opportunity-") && (
            <a
              href={`/dashboard/inbox?reservation=${encodeURIComponent(opportunity.id)}`}
              className="hidden rounded-md border border-ink/15 px-3 py-2 text-sm font-bold text-ink hover:bg-ink/5 sm:block"
            >
              Conversation
            </a>
          )}
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-2xl text-ink/55 hover:bg-ink/5" aria-label="Close contact workspace">×</button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_58px] sm:grid-cols-[minmax(0,1fr)_66px]">
          <div className="min-h-0 overflow-y-auto p-3 sm:p-5">
            {mode === "details" && (
              <div className="space-y-4">
                <section className="rounded-md border border-ink/10 bg-white">
                  <ModuleHeader title="Contact details" />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dce9ff] font-bold text-[#2468ec]">{initials(opportunity.guestName)}</div>
                        <strong className="truncate text-lg">{opportunity.guestName}</strong>
                      </div>
                      {onDelete && <button type="button" onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-md text-red-700 hover:bg-red-50" aria-label="Delete contact">⌫</button>}
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-bold text-ink/60">Owner
                        <select value={record.owner} onChange={(event) => setRecord((current) => ({ ...current, owner: event.target.value }))} className={`${inputClass} mt-2`}>
                          <option>Unassigned</option><option>David Alvarez</option><option>Reservations team</option>
                        </select>
                      </label>
                      <label className="text-sm font-bold text-ink/60">Followers
                        <select className={`${inputClass} mt-2`} defaultValue="none"><option value="none">No followers</option><option>David Alvarez</option></select>
                      </label>
                    </div>
                    <div className="mt-5">
                      <p className="text-sm font-bold text-ink/60">Tags</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {record.tags.map((tag) => (
                          <button key={tag} type="button" onClick={() => setRecord((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }))} className="rounded-md border border-ink/15 px-2.5 py-1.5 text-xs font-semibold text-ink/65" title="Remove tag">{tag} ×</button>
                        ))}
                        <form onSubmit={addTag}>
                          <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="Add tag" className="h-8 w-24 rounded-md border border-ink/15 px-2 text-xs outline-none focus:border-ink" />
                        </form>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-md border border-ink/10 bg-white">
                  <div className="grid grid-cols-3 border-b border-ink/10 text-center text-sm font-bold">
                    <span className="bg-ink/5 px-3 py-3">All fields</span><span className="px-3 py-3 text-ink/45">DND</span><span className="px-3 py-3 text-ink/45">Actions</span>
                  </div>
                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    <label className="text-sm font-bold text-ink/50">Email<input value={record.email} onChange={(event) => setRecord((current) => ({ ...current, email: event.target.value }))} placeholder="Add email" className={`${inputClass} mt-2`} /></label>
                    <label className="text-sm font-bold text-ink/50">Phone<input value={record.phone} onChange={(event) => setRecord((current) => ({ ...current, phone: event.target.value }))} placeholder="Add phone" className={`${inputClass} mt-2`} /></label>
                    <label className="text-sm font-bold text-ink/50">Contact source<input value={record.source} onChange={(event) => setRecord((current) => ({ ...current, source: event.target.value }))} className={`${inputClass} mt-2`} /></label>
                    <label className="text-sm font-bold text-ink/50">Contact type<select value={record.contactType} onChange={(event) => setRecord((current) => ({ ...current, contactType: event.target.value }))} className={`${inputClass} mt-2`}><option>Lead</option><option>Guest</option><option>Past guest</option></select></label>
                    <div><p className="text-sm font-bold text-ink/50">Tentative date</p><p className="mt-2 text-sm font-semibold">{readableDate(opportunity.checkIn)}</p></div>
                    <div><p className="text-sm font-bold text-ink/50">Guests</p><p className="mt-2 text-sm font-semibold">{opportunity.guestCount ?? 1}</p></div>
                  </div>
                </section>
              </div>
            )}

            {mode === "opportunity" && (
              <div className="space-y-4">
                <section className="rounded-md border border-ink/10 bg-white">
                  <ModuleHeader title="Opportunity" />
                  <div className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><p className="text-sm font-bold">Direct booking pipeline</p><p className="mt-1 text-sm text-ink/50">{opportunity.guestName}</p></div>
                      <select value={opportunity.stage} onChange={(event) => onUpdate({ stage: event.target.value as Stage })} className="h-10 rounded-md border border-ink/15 bg-ink/5 px-3 text-sm font-bold">
                        {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
                      </select>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink/10 pt-5">
                      <div><p className="text-xs font-bold uppercase text-ink/35">Value</p><p className="mt-2 text-lg font-bold">{money(quoteTotal)}</p></div>
                      <div><p className="text-xs font-bold uppercase text-ink/35">Status</p><p className="mt-2 text-sm font-bold text-[#2468ec]">Open</p></div>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 text-sm"><strong>Primary</strong><span className="text-ink/45">{opportunity.channel}</span></div>
                  </div>
                </section>

                <section className="rounded-md border border-ink/10 bg-white">
                  <ModuleHeader title="Reservation" />
                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    <div className="sm:col-span-2"><p className="text-xs font-bold uppercase text-ink/35">Rental</p><p className="mt-1 font-bold">{opportunity.propertyName}{opportunity.propertyUnit ? ` · ${opportunity.propertyUnit}` : ""}</p></div>
                    <div><p className="text-xs font-bold uppercase text-ink/35">Check-in</p><p className="mt-1 text-sm font-semibold">{readableDate(opportunity.checkIn)}</p></div>
                    <div><p className="text-xs font-bold uppercase text-ink/35">Check-out</p><p className="mt-1 text-sm font-semibold">{readableDate(opportunity.checkOut ?? "")}</p></div>
                    <div><p className="text-xs font-bold uppercase text-ink/35">Length</p><p className="mt-1 text-sm font-semibold">{stayNights} {stayNights === 1 ? "night" : "nights"}</p></div>
                    <div><p className="text-xs font-bold uppercase text-ink/35">Guests</p><p className="mt-1 text-sm font-semibold">{opportunity.guestCount ?? 1} total</p></div>
                    <div className="sm:col-span-2"><p className="text-xs font-bold uppercase text-ink/35">Guest mix</p><p className="mt-1 text-sm text-ink/65">{opportunity.adults ?? opportunity.guestCount ?? 1} adults · {opportunity.children ?? 0} children · {opportunity.infants ?? 0} infants · {opportunity.pets ?? 0} pets</p></div>
                    <div><p className="text-xs font-bold uppercase text-ink/35">Channel</p><p className="mt-1 text-sm font-semibold">{opportunity.channel}</p></div>
                    <div><p className="text-xs font-bold uppercase text-ink/35">Quote</p><p className="mt-1 text-sm font-semibold">{opportunity.hasQuote ? "Included" : "Estimated"}</p></div>
                  </div>
                </section>

                {quoteBreakdownPanel()}
              </div>
            )}

            {mode === "tasks" && (
              <section className="rounded-md border border-ink/10 bg-white">
                <ModuleHeader title="Tasks" addLabel="Add" onAdd={() => setTaskFormOpen(true)} />
                <div className="border-b border-ink/10 p-4"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title" className={inputClass} /></div>
                {taskFormOpen && (
                  <form onSubmit={addTask} className="grid gap-3 border-b border-ink/10 bg-ink/[0.02] p-4 sm:grid-cols-[1fr_170px_auto]">
                    <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Task title" className={inputClass} autoFocus />
                    <input type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} className={inputClass} />
                    <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-bold text-white">Save</button>
                  </form>
                )}
                {filteredTasks.length === 0 ? (
                  <EmptyState title="No tasks yet" description="Stay organized by creating your first task." action={<button type="button" onClick={() => setTaskFormOpen(true)} className="rounded-md border border-ink/15 px-4 py-2 text-sm font-bold">Add task</button>} />
                ) : (
                  <div className="divide-y divide-ink/10">
                    {filteredTasks.map((task) => (
                      <label key={task.id} className="flex items-center gap-3 px-5 py-4">
                        <input type="checkbox" checked={task.completed} onChange={(event) => setRecord((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === task.id ? { ...item, completed: event.target.checked } : item) }))} />
                        <span className={`min-w-0 flex-1 text-sm font-semibold ${task.completed ? "text-ink/35 line-through" : ""}`}>{task.title}</span>
                        <span className="text-xs text-ink/45">{task.dueDate ? readableDate(task.dueDate) : "No due date"}</span>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            )}

            {mode === "notes" && (
              <section className="rounded-md border border-ink/10 bg-white">
                <ModuleHeader title="Notes" />
                <div className="p-5">
                  <textarea value={record.note} onChange={(event) => { setRecord((current) => ({ ...current, note: event.target.value })); setNoteSaved(false); }} placeholder="Add context, preferences or follow-up notes..." className="min-h-[320px] w-full resize-y rounded-md border border-ink/15 p-4 text-sm leading-6 outline-none focus:border-ink" />
                  <div className="mt-4 flex items-center justify-between"><span className="text-xs text-ink/40">{noteSaved ? "Saved" : "Changes save automatically"}</span><button type="button" onClick={() => { setNoteSaved(true); onUpdate({ noteCount: record.note.trim() ? 1 : 0 }); }} className="rounded-md bg-ink px-5 py-2.5 text-sm font-bold text-white">Save note</button></div>
                </div>
              </section>
            )}

            {mode === "appointments" && (
              <section className="rounded-md border border-ink/10 bg-white">
                <ModuleHeader title="Appointments" addLabel="Add" onAdd={() => setAppointmentFormOpen(true)} />
                <div className="space-y-3 border-b border-ink/10 p-4">
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search appointments" className={inputClass} />
                  <div className="grid grid-cols-2 overflow-hidden rounded-md border border-ink/10 text-center text-sm font-bold">
                    <button type="button" onClick={() => setAppointmentTab("upcoming")} className={`px-3 py-2 ${appointmentTab === "upcoming" ? "bg-ink/5" : "text-ink/45"}`}>Upcoming</button>
                    <button type="button" onClick={() => setAppointmentTab("past")} className={`px-3 py-2 ${appointmentTab === "past" ? "bg-ink/5" : "text-ink/45"}`}>Past</button>
                  </div>
                </div>
                {appointmentFormOpen && (
                  <form onSubmit={addAppointment} className="grid gap-3 border-b border-ink/10 bg-ink/[0.02] p-4 sm:grid-cols-[1fr_210px_auto]">
                    <input value={appointmentTitle} onChange={(event) => setAppointmentTitle(event.target.value)} placeholder="Appointment title" className={inputClass} autoFocus />
                    <input type="datetime-local" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} className={inputClass} />
                    <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-bold text-white">Save</button>
                  </form>
                )}
                {visibleAppointments.length === 0 ? (
                  <EmptyState title={`No ${appointmentTab} appointments`} description="Keep things moving by creating the next guest appointment." action={<button type="button" onClick={() => setAppointmentFormOpen(true)} className="rounded-md border border-ink/15 px-4 py-2 text-sm font-bold">Add appointment</button>} />
                ) : (
                  <div className="divide-y divide-ink/10">
                    {visibleAppointments.map((appointment) => <div key={appointment.id} className="flex items-center justify-between gap-4 px-5 py-4"><strong className="text-sm">{appointment.title}</strong><span className="text-xs text-ink/45">{readableDate(appointment.startsAt)}</span></div>)}
                  </div>
                )}
              </section>
            )}

            {mode === "payments" && (
              <div className="space-y-4">
                {quoteBreakdownPanel()}
                <section className="rounded-md border border-ink/10 bg-white">
                  <ModuleHeader title="Payments" addLabel="New payment" onAdd={() => setPaymentFormOpen(true)} />
                  {paymentFormOpen && (
                    <form onSubmit={addPayment} className="grid gap-3 border-b border-ink/10 bg-ink/[0.02] p-4 sm:grid-cols-[1fr_170px_auto]">
                      <input value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} inputMode="decimal" placeholder="Amount" className={inputClass} autoFocus />
                      <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as TransactionItem["status"])} className={inputClass}><option>Paid</option><option>Pending</option><option>Refunded</option></select>
                      <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-bold text-white">Save</button>
                    </form>
                  )}
                  <div className="grid grid-cols-3 border-b border-ink/10 bg-ink/[0.02] px-4 py-3 text-xs font-bold uppercase text-ink/45"><span>Date</span><span>Amount</span><span>Status</span></div>
                  {record.transactions.length === 0 ? <EmptyState title="No transactions found" description="Create a new payment to start tracking this reservation." /> : (
                    <div className="divide-y divide-ink/10">
                      {record.transactions.map((transaction) => <div key={transaction.id} className="grid grid-cols-3 px-4 py-4 text-sm"><span>{readableDate(transaction.date)}</span><strong>{money(transaction.amount)}</strong><span>{transaction.status}</span></div>)}
                    </div>
                  )}
                </section>
                <section className="rounded-md border border-ink/10 bg-white">
                  <ModuleHeader title="Invoices" />
                  <div className="grid grid-cols-3 border-b border-ink/10 bg-ink/[0.02] px-4 py-3 text-xs font-bold uppercase text-ink/45"><span>Date</span><span>Amount</span><span>Status</span></div>
                  <div className="grid min-h-36 place-items-center text-sm text-ink/45">No invoices found</div>
                </section>
              </div>
            )}
          </div>

          <nav className="flex flex-col items-center gap-2 border-l border-ink/10 bg-[#eef1f5] py-4" aria-label="Contact workspace tools">
            {railItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeMode(item.id)}
                aria-label={item.label}
                aria-pressed={mode === item.id}
                title={item.label}
                className={`grid h-11 w-11 place-items-center rounded-md transition ${mode === item.id ? "bg-white text-[#2468ec] shadow-sm" : "text-ink/75 hover:bg-white"}`}
              >
                <WorkspaceIcon name={item.icon} />
              </button>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
