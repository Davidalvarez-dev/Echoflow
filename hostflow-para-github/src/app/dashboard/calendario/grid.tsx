"use client";

export type PropertyRow = {
  id: string;
  name: string;
  unit: string | null;
  nightlyRate: number;
  reservations: {
    id: string;
    guestName: string;
    checkIn: Date;
    checkOut: Date;
    channel: string;
  }[];
};

const DAY_MS = 86_400_000;

const channelColor: Record<string, string> = {
  DIRECT: "bg-ink text-cream",
  AIRBNB: "bg-[#ff5a5f] text-white",
  BOOKING: "bg-[#003580] text-white",
  VRBO: "bg-[#1d3e6e] text-white",
};

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

function money(n: number) {
  return `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
}

export function CalendarGrid({
  rows,
  days,
  rangeStart,
}: {
  rows: PropertyRow[];
  days: Date[];
  rangeStart: Date;
}) {
  const dayCount = days.length;
  const templateColumns = `220px repeat(${dayCount}, minmax(84px, 1fr))`;

  return (
    <div className="min-w-fit p-6">
      <div
        className="grid overflow-hidden rounded-2xl border border-ink/10 bg-white"
        style={{ gridTemplateColumns: templateColumns }}
      >
        {/* Header row */}
        <div className="sticky left-0 z-20 border-b border-r border-ink/10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-widest text-ink/40">
          Propiedad
        </div>
        {days.map((day) => {
          const isToday = diffDays(day, new Date()) === 0;
          return (
            <div
              key={day.toISOString()}
              className={`border-b border-r border-ink/5 px-2 py-3 text-center text-xs font-semibold ${
                isToday ? "bg-coral/20 text-ink" : "text-ink/50"
              }`}
            >
              <div className="uppercase">
                {day.toLocaleDateString("es-MX", { weekday: "short" })}
              </div>
              <div className="font-display text-sm text-ink">
                {day.getDate()}
              </div>
            </div>
          );
        })}

        {/* Property rows */}
        {rows.map((property, rowIndex) => {
          const gridRow = rowIndex + 2;
          return (
            <div key={property.id} className="contents">
              <div
                className="sticky left-0 z-10 flex items-center gap-2 border-b border-r border-ink/10 bg-white px-4 py-4"
                style={{ gridRow, gridColumn: 1 }}
              >
                <div className="h-8 w-8 shrink-0 rounded-lg bg-teal/20" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {property.name}
                  </p>
                  {property.unit && (
                    <p className="text-xs text-ink/40">{property.unit}</p>
                  )}
                </div>
              </div>

              {days.map((day, i) => (
                <div
                  key={i}
                  className="border-b border-r border-ink/5 px-1 py-4 text-center text-xs text-ink/40"
                  style={{ gridRow, gridColumn: i + 2 }}
                >
                  {money(property.nightlyRate)}
                </div>
              ))}

              {property.reservations.map((res) => {
                const start = Math.max(0, diffDays(rangeStart, res.checkIn));
                const end = Math.min(dayCount, diffDays(rangeStart, res.checkOut));
                const span = Math.max(1, end - start);
                return (
                  <div
                    key={res.id}
                    style={{
                      gridRow,
                      gridColumn: `${start + 2} / span ${span}`,
                    }}
                    className="z-[5] m-1.5 flex items-center overflow-hidden rounded-full px-3 py-2"
                  >
                    <span
                      className={`w-full truncate rounded-full px-3 py-1.5 text-xs font-semibold ${
                        channelColor[res.channel] ?? "bg-ink text-cream"
                      }`}
                    >
                      {res.guestName}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
