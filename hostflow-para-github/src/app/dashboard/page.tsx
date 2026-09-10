import { db } from "@/lib/db";
import { stageOf } from "@/lib/pipeline";
import { type AnalyticsReservation, type CommercialLine } from "./analytics-dashboard";
import { RoleDashboard, type DashboardBusinessUnit } from "./role-dashboard";
import { Sidebar } from "./sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [reservations, sales, properties, businessUnits] = await Promise.all([
    db.reservation.findMany({ orderBy: { checkIn: "desc" }, include: { guest: true, property: true } }),
    db.sale.findMany({
      where: { status: "PAID" },
      include: {
        lines: {
          include: {
            item: { select: { cost: true } },
          },
        },
      },
    }),
    db.property.findMany({ select: { nightlyRate: true } }),
    db.businessUnit.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, type: true, color: true },
    }),
  ]);

  const analyticsReservations: AnalyticsReservation[] = reservations.map((reservation) => ({
    id: reservation.id,
    checkIn: reservation.checkIn.toISOString(),
    checkOut: reservation.checkOut.toISOString(),
    status: reservation.status,
    stage: stageOf(reservation),
    opportunityStatus: reservation.opportunityStatus,
    channel: reservation.channel,
    totalAmount: reservation.totalAmount,
    paidAmount: reservation.paidAmount,
    hasQuote: reservation.hasQuote,
    source: reservation.source,
    createdAt: reservation.createdAt.toISOString(),
    guestName: reservation.guest.name,
    propertyName: reservation.property.name,
  }));
  const commercialLines: CommercialLine[] = sales.flatMap((sale) => sale.lines.map((line) => ({
    id: line.id,
    saleId: sale.id,
    createdAt: sale.createdAt.toISOString(),
    itemName: line.itemName,
    businessUnitName: line.businessUnitName,
    categoryName: line.categoryName,
    quantity: line.quantity,
    total: line.total,
    unitCost: line.item?.cost ?? 0,
  })));
  const dashboardBusinessUnits: DashboardBusinessUnit[] = businessUnits.map((unit) => ({
    ...unit,
    type: unit.type,
  }));
  const averageNightlyRate = properties.length
    ? properties.reduce((sum, property) => sum + property.nightlyRate, 0) / properties.length
    : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard" />
      <RoleDashboard
        reservations={analyticsReservations}
        commercialLines={commercialLines}
        propertyCount={properties.length}
        averageNightlyRate={averageNightlyRate}
        businessUnits={dashboardBusinessUnits}
      />
    </div>
  );
}
