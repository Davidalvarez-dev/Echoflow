"use client";

import { useState } from "react";

export type ReservationRow = {
  id: string;
  property: string;
  unit: string | null;
  date: Date;
  dateOut: Date;
  channel: string;
  guestName: string;
  guestCount: number;
};

const channelLabel: Record<string, string> = {
  DIRECT: "Directo",
  AIRBNB: "Airbnb",
  BOOKING: "Booking",
  VRBO: "Vrbo",
};

function formatDate(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000
  );
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  return target.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function DashboardTables({
  arrivals,
  departures,
  staying,
}: {
  arrivals: ReservationRow[];
  departures: ReservationRow[];
  staying: ReservationRow[];
}) {
  const tabs = [
    { key: "arrivals", label: "Próximas llegadas", rows: arrivals, dateField: "date" as const },
    { key: "departures", label: "Próximas salidas", rows: departures, dateField: "dateOut" as const },
    { key: "staying", label: "Hospedados ahora", rows: staying, dateField: "date" as const },
  ];
  const [active, setActive] = useState(tabs[0].key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-ink/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              active === tab.key
                ? "border-ink text-ink"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            {tab.label} ({tab.rows.length})
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        {current.rows.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink/50">
            No hay reservas en esta vista todavía.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs font-semibold uppercase tracking-widest text-ink/40">
                <th className="px-6 py-3">Propiedad</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Canal</th>
                <th className="px-6 py-3">Huésped</th>
              </tr>
            </thead>
            <tbody>
              {current.rows.map((row) => (
                <tr key={row.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-ink">{row.property}</p>
                    {row.unit && (
                      <p className="text-xs text-ink/50">{row.unit}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-ink/70">
                    {formatDate(row[current.dateField])}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-coral/20 px-2.5 py-1 text-xs font-semibold text-ink">
                      {channelLabel[row.channel] ?? row.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-ink">{row.guestName}</p>
                    <p className="text-xs text-ink/50">
                      {row.guestCount} {row.guestCount === 1 ? "huésped" : "huéspedes"}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
