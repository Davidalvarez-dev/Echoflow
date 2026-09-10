"use client";

import { useState } from "react";
import { NewReservationModal } from "./new-reservation-modal";

export type ReservationDetail = {
  id: string;
  status: string;
  channel: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  createdAt: Date;
  property: { name: string; unit: string | null };
  guest: {
    name: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    language: string | null;
  };
};

const statusLabel: Record<string, string> = {
  CONFIRMED: "Reservado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
};

const channelLabel: Record<string, string> = {
  DIRECT: "Directo",
  AIRBNB: "Airbnb",
  BOOKING: "Booking",
  VRBO: "Vrbo",
};

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function nights(checkIn: Date, checkOut: Date) {
  return Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
    )
  );
}

export function ReservationsBrowser({
  reservations,
  properties,
}: {
  reservations: ReservationDetail[];
  properties: { id: string; name: string; unit: string | null }[];
}) {
  const [selectedId, setSelectedId] = useState(reservations[0]?.id ?? null);
  const selected = reservations.find((r) => r.id === selectedId) ?? reservations[0];

  if (!selected) {
    return (
      <div className="flex h-full min-h-0 overflow-hidden">
        <div className="flex min-h-0 w-80 shrink-0 flex-col border-r border-ink/10 bg-white">
          <div className="shrink-0 border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">Reservas</h2>
            <p className="text-xs text-ink/50">0 en total</p>
          </div>
          <div className="flex-1" />
          <div className="shrink-0 border-t border-ink/10 p-4">
            <NewReservationModal properties={properties} />
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
          <h3 className="font-display text-2xl font-bold text-ink">Reservas</h3>
          <p className="max-w-sm text-sm text-ink/50">
            Una reserva con cotización ya incluye el desglose de costos
            (promociones, extras, tarifas y descuentos). Una reserva sin
            cotización solo guarda los datos básicos — puedes agregar el
            monto después.
          </p>
        </div>
      </div>
    );
  }

  const due = selected.totalAmount - selected.paidAmount;
  const n = nights(selected.checkIn, selected.checkOut);
  const base = selected.totalAmount * 0.75;
  const cleaning = selected.totalAmount * 0.1;
  const tax = selected.totalAmount - base - cleaning;

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* List */}
      <div className="flex min-h-0 w-80 shrink-0 flex-col border-r border-ink/10 bg-white">
        <div className="shrink-0 border-b border-ink/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink">Reservas</h2>
          <p className="text-xs text-ink/50">{reservations.length} en total</p>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {reservations.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setSelectedId(r.id)}
                className={`block w-full border-b border-ink/5 px-5 py-4 text-left transition ${
                  r.id === selected.id ? "bg-coral/15" : "hover:bg-ink/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cream">
                    {statusLabel[r.status] ?? r.status}
                  </span>
                  <span className="text-xs text-ink/40">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-ink">{r.guest.name}</p>
                <p className="text-xs text-ink/50">
                  {formatDate(r.checkIn)} – {formatDate(r.checkOut)} · {r.guestCount}{" "}
                  {r.guestCount === 1 ? "huésped" : "huéspedes"}
                </p>
              </button>
            </li>
          ))}
        </ul>
        <div className="shrink-0 border-t border-ink/10 bg-white p-4">
          <NewReservationModal properties={properties} />
        </div>
      </div>

      {/* Detail */}
      <div className="min-h-0 flex-1 overflow-y-auto p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">
              {selected.guest.name}
            </h1>
            <p className="mt-1 text-sm text-ink/50">
              Reserva #{selected.id.slice(0, 8).toUpperCase()} · creada el{" "}
              {formatDate(selected.createdAt)}
            </p>
          </div>
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cream">
            {channelLabel[selected.channel] ?? selected.channel}
          </span>
        </div>

        <p className="mt-4 font-semibold text-ink">
          {selected.property.name}
          {selected.property.unit ? ` — ${selected.property.unit}` : ""} ·{" "}
          {selected.guestCount} {selected.guestCount === 1 ? "huésped" : "huéspedes"}
        </p>
        <p className="text-sm text-ink/60">
          {formatDate(selected.checkIn)} → {formatDate(selected.checkOut)} · {n}{" "}
          {n === 1 ? "noche" : "noches"}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Pagado
            </p>
            <p className="font-display mt-1 text-xl font-bold text-ink">
              {money(selected.paidAmount, selected.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Pendiente
            </p>
            <p className="font-display mt-1 text-xl font-bold text-ink">
              {money(Math.max(due, 0), selected.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Total
            </p>
            <p className="font-display mt-1 text-xl font-bold text-ink">
              {money(selected.totalAmount, selected.currency)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-ink/10 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-ink">Cotización</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-ink/70">
                  <dt>{selected.property.name}</dt>
                  <dd>{money(base, selected.currency)}</dd>
                </div>
                <div className="flex justify-between text-ink/70">
                  <dt>Limpieza</dt>
                  <dd>{money(cleaning, selected.currency)}</dd>
                </div>
                <div className="flex justify-between text-ink/70">
                  <dt>Impuestos</dt>
                  <dd>{money(tax, selected.currency)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-semibold text-ink">
                  <dt>Total</dt>
                  <dd>{money(selected.totalAmount, selected.currency)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-ink/40">
                Desglose estimado — pendiente de modelo de cotización real.
              </p>
            </section>

            <section className="rounded-2xl border border-ink/10 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-ink">Cobros</h3>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-ink/70">
                  {formatDate(selected.createdAt)} · Pago
                </span>
                <span
                  className={
                    selected.paidAmount >= selected.totalAmount
                      ? "font-semibold text-green-700"
                      : "font-semibold text-ink/40"
                  }
                >
                  {selected.paidAmount >= selected.totalAmount
                    ? "Cobrado"
                    : "Pendiente"}
                </span>
                <span className="font-semibold text-ink">
                  {money(selected.paidAmount, selected.currency)}
                </span>
              </div>
              <p className="mt-4 text-xs text-ink/40">
                Sin pasarela de pago conectada todavía — sección de referencia.
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-ink/10 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-ink">Huésped</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-ink/40">Nombre</dt>
                  <dd className="text-ink">{selected.guest.name}</dd>
                </div>
                {selected.guest.email && (
                  <div>
                    <dt className="text-xs text-ink/40">Email</dt>
                    <dd className="text-ink">{selected.guest.email}</dd>
                  </div>
                )}
                {selected.guest.phone && (
                  <div>
                    <dt className="text-xs text-ink/40">Teléfono</dt>
                    <dd className="text-ink">{selected.guest.phone}</dd>
                  </div>
                )}
                {selected.guest.location && (
                  <div>
                    <dt className="text-xs text-ink/40">Ubicación</dt>
                    <dd className="text-ink">{selected.guest.location}</dd>
                  </div>
                )}
                {selected.guest.language && (
                  <div>
                    <dt className="text-xs text-ink/40">Idioma</dt>
                    <dd className="text-ink">{selected.guest.language}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="rounded-2xl border border-ink/10 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-ink">
                Check-in online
              </h3>
              <p className="mt-2 text-sm text-ink/60">
                Gestiona el check-in de tus huéspedes con formularios inteligentes.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 rounded-full bg-ink/10 px-4 py-2 text-sm font-semibold text-ink/40"
              >
                Próximamente
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
