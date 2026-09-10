"use client";

import { useLanguage } from "../../language-provider";

export type TodayReservation = {
  id: string;
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalAmount: number;
  paidAmount: number;
};

function money(value: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);
}

function Column({
  title,
  accent,
  items,
  emptyText,
  showBalance,
  language,
}: {
  title: string;
  accent: string;
  items: TodayReservation[];
  emptyText: string;
  showBalance?: boolean;
  language: "es" | "en";
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
          <h2 className="text-sm font-bold text-ink">{title}</h2>
        </div>
        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-ink/5 px-2 text-xs font-extrabold text-ink">
          {items.length}
        </span>
      </header>
      <div className="min-h-0 flex-1 divide-y divide-ink/5 overflow-y-auto">
        {items.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink/35">{emptyText}</p>}
        {items.map((item) => {
          const pending = item.totalAmount - item.paidAmount;
          return (
            <a
              key={item.id}
              href={`/dashboard/reservas`}
              className="block px-5 py-3.5 transition hover:bg-ink/[0.03]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-ink">{item.guestName}</p>
                <span className="shrink-0 text-xs font-semibold text-ink/45">
                  {item.guestCount} {language === "es" ? "hués." : "guests"}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="truncate text-xs text-ink/50">{item.propertyName}</p>
                {showBalance && (
                  pending > 0
                    ? <span className="shrink-0 rounded-full bg-[#fdeaea] px-2 py-0.5 text-[11px] font-bold text-[#b3402e]">
                        {language === "es" ? "Debe" : "Due"} {money(pending)}
                      </span>
                    : <span className="shrink-0 rounded-full bg-[#e5f4ee] px-2 py-0.5 text-[11px] font-bold text-[#0f7657]">
                        {language === "es" ? "Pagado" : "Paid"}
                      </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function TodayBoard({
  arrivals,
  departures,
  staying,
  arrivalsTomorrow,
}: {
  arrivals: TodayReservation[];
  departures: TodayReservation[];
  staying: TodayReservation[];
  arrivalsTomorrow: TodayReservation[];
}) {
  const { language } = useLanguage();
  const es = language === "es";
  const todayLabel = new Date().toLocaleDateString(es ? "es-MX" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f6f7f9]">
      <header className="shrink-0 border-b border-ink/10 bg-white px-8 py-5">
        <h1 className="font-display text-2xl font-extrabold text-ink">{es ? "Hoy" : "Today"}</h1>
        <p className="mt-0.5 text-sm capitalize text-ink/45">{todayLabel} · Hospedaje</p>
      </header>
      <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-6 lg:grid-cols-2 xl:grid-cols-4">
        <Column
          title={es ? "Llegadas de hoy" : "Today's arrivals"}
          accent="#0f7657"
          items={arrivals}
          emptyText={es ? "Sin llegadas hoy" : "No arrivals today"}
          showBalance
          language={language}
        />
        <Column
          title={es ? "Salidas de hoy" : "Today's departures"}
          accent="#b3402e"
          items={departures}
          emptyText={es ? "Sin salidas hoy" : "No departures today"}
          showBalance
          language={language}
        />
        <Column
          title={es ? "Hospedados ahora" : "Staying now"}
          accent="#2468ec"
          items={staying}
          emptyText={es ? "Nadie hospedado" : "No one staying"}
          language={language}
        />
        <Column
          title={es ? "Llegadas de mañana" : "Tomorrow's arrivals"}
          accent="#d8aa22"
          items={arrivalsTomorrow}
          emptyText={es ? "Sin llegadas mañana" : "No arrivals tomorrow"}
          language={language}
        />
      </div>
    </main>
  );
}
