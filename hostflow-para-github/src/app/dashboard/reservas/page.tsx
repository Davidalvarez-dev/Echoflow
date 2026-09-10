import { db } from "@/lib/db";
import { Sidebar } from "../sidebar";
import { ReservationsBrowser, type ReservationDetail } from "./browser";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const [reservations, properties] = await Promise.all([
    db.reservation.findMany({
      orderBy: { checkIn: "desc" },
      include: { property: true, guest: true },
      take: 30,
    }),
    db.property.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows: ReservationDetail[] = reservations.map((r) => ({
    id: r.id,
    status: r.status,
    channel: r.channel,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    guestCount: r.guestCount,
    totalAmount: r.totalAmount,
    paidAmount: r.paidAmount,
    currency: r.currency,
    createdAt: r.createdAt,
    property: { name: r.property.name, unit: r.property.unit },
    guest: {
      name: r.guest.name,
      email: r.guest.email,
      phone: r.guest.phone,
      location: r.guest.location,
      language: r.guest.language,
    },
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/reservas" />
      <main className="min-h-0 flex-1 overflow-hidden">
        <ReservationsBrowser reservations={rows} properties={properties} />
      </main>
    </div>
  );
}
