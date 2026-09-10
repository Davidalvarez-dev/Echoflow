import { db } from "@/lib/db";
import { Sidebar } from "../sidebar";
import { NewReservationModal } from "../reservas/new-reservation-modal";
import { CalendarGrid, type PropertyRow } from "./grid";

const DAYS_VISIBLE = 14;

function parseStart(param: string | undefined) {
  const d = param ? new Date(param) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toParam(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const rangeStart = parseStart(start);
  const rangeEnd = addDays(rangeStart, DAYS_VISIBLE);

  const [properties, reservations] = await Promise.all([
    db.property.findMany({ orderBy: { name: "asc" } }),
    db.reservation.findMany({
      where: {
        checkIn: { lt: rangeEnd },
        checkOut: { gt: rangeStart },
        status: { not: "CANCELLED" },
      },
      include: { guest: true },
    }),
  ]);

  const rows: PropertyRow[] = properties.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    nightlyRate: p.nightlyRate,
    reservations: reservations
      .filter((r) => r.propertyId === p.id)
      .map((r) => ({
        id: r.id,
        guestName: r.guest.name,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        channel: r.channel,
      })),
  }));

  const days = Array.from({ length: DAYS_VISIBLE }, (_, i) =>
    addDays(rangeStart, i)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/calendario" />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 flex items-center justify-between border-b border-ink/10 bg-white px-6 py-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Calendario
            </h1>
            <p className="text-sm text-ink/50">
              {rangeStart.toLocaleDateString("es-MX", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/dashboard/calendario?start=${toParam(addDays(rangeStart, -DAYS_VISIBLE))}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink hover:border-ink"
              aria-label="Anterior"
            >
              ‹
            </a>
            <a
              href={`/dashboard/calendario?start=${toParam(addDays(rangeStart, DAYS_VISIBLE))}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink hover:border-ink"
              aria-label="Siguiente"
            >
              ›
            </a>
            <NewReservationModal properties={properties} compact />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <CalendarGrid rows={rows} days={days} rangeStart={rangeStart} />
        </div>
      </main>
    </div>
  );
}
