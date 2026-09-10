import { db } from "@/lib/db";
import { Sidebar } from "../sidebar";
import { MyDay, type MyDayData } from "./my-day";

export const dynamic = "force-dynamic";

function dayRange(offset = 0) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offset);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export default async function MyDayPage() {
  const today = dayRange();
  const tomorrow = dayRange(1);

  const [departures, arrivals, arrivalsTomorrow, stayingCount] = await Promise.all([
    db.reservation.findMany({
      where: { status: { not: "CANCELLED" }, checkOut: { gte: today.start, lt: today.end } },
      include: { property: true },
      orderBy: { checkOut: "asc" },
    }),
    db.reservation.findMany({
      where: { status: { not: "CANCELLED" }, checkIn: { gte: today.start, lt: today.end } },
      include: { property: true },
      orderBy: { checkIn: "asc" },
    }),
    db.reservation.count({
      where: { status: { not: "CANCELLED" }, checkIn: { gte: tomorrow.start, lt: tomorrow.end } },
    }),
    db.reservation.count({
      where: { status: { not: "CANCELLED" }, checkIn: { lt: today.end }, checkOut: { gte: today.start } },
    }),
  ]);

  const data: MyDayData = {
    departures: departures.map((reservation) => ({
      id: reservation.id,
      propertyName: reservation.property.name,
      guestCount: reservation.guestCount,
    })),
    arrivals: arrivals.map((reservation) => ({
      id: reservation.id,
      propertyName: reservation.property.name,
      guestCount: reservation.guestCount,
    })),
    arrivalsTomorrow,
    guestsToday: stayingCount,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/mi-dia" />
      <MyDay data={data} />
    </div>
  );
}
