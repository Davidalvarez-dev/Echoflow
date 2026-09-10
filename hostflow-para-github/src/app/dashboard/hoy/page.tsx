import { db } from "@/lib/db";
import { Sidebar } from "../sidebar";
import { TodayBoard, type TodayReservation } from "./today-board";

export const dynamic = "force-dynamic";

function dayRange(offset = 0) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offset);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export default async function TodayPage() {
  const today = dayRange();
  const tomorrow = dayRange(1);

  const [arrivals, departures, staying, arrivalsTomorrow] = await Promise.all([
    db.reservation.findMany({
      where: { status: { not: "CANCELLED" }, checkIn: { gte: today.start, lt: today.end } },
      include: { guest: true, property: true },
      orderBy: { checkIn: "asc" },
    }),
    db.reservation.findMany({
      where: { status: { not: "CANCELLED" }, checkOut: { gte: today.start, lt: today.end } },
      include: { guest: true, property: true },
      orderBy: { checkOut: "asc" },
    }),
    db.reservation.findMany({
      where: { status: { not: "CANCELLED" }, checkIn: { lt: today.start }, checkOut: { gte: today.end } },
      include: { guest: true, property: true },
      orderBy: { checkOut: "asc" },
    }),
    db.reservation.findMany({
      where: { status: { not: "CANCELLED" }, checkIn: { gte: tomorrow.start, lt: tomorrow.end } },
      include: { guest: true, property: true },
      orderBy: { checkIn: "asc" },
    }),
  ]);

  const serialize = (list: typeof arrivals): TodayReservation[] =>
    list.map((reservation) => ({
      id: reservation.id,
      guestName: reservation.guest.name,
      propertyName: reservation.property.name,
      checkIn: reservation.checkIn.toISOString(),
      checkOut: reservation.checkOut.toISOString(),
      guestCount: reservation.guestCount,
      totalAmount: reservation.totalAmount,
      paidAmount: reservation.paidAmount,
    }));

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/hoy" />
      <TodayBoard
        arrivals={serialize(arrivals)}
        departures={serialize(departures)}
        staying={serialize(staying)}
        arrivalsTomorrow={serialize(arrivalsTomorrow)}
      />
    </div>
  );
}
