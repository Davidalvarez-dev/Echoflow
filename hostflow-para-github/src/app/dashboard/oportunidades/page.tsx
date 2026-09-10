import { db } from "@/lib/db";
import { stageOf } from "@/lib/pipeline";
import { Sidebar } from "../sidebar";
import {
  OpportunitiesBoard,
  type OpportunitySeed,
} from "./opportunities-board";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const [reservations, catalogItems] = await Promise.all([
    db.reservation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        guest: true,
        property: true,
        quotes: { include: { lines: { orderBy: { position: "asc" } } }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    db.catalogItem.findMany({ where: { isActive: true }, include: { businessUnit: true, category: true }, orderBy: { name: "asc" } }),
  ]);

  const opportunities: OpportunitySeed[] = reservations.map((reservation) => ({
      id: reservation.id,
      guestName: reservation.guest.name,
      propertyName: reservation.property.name,
      value: reservation.totalAmount,
      channel: reservation.channel,
      checkIn: reservation.checkIn.toISOString(),
      checkOut: reservation.checkOut.toISOString(),
      email: reservation.guest.email,
      phone: reservation.guest.phone,
      source: reservation.source,
      guestCount: reservation.guestCount,
      paidAmount: reservation.paidAmount,
      reservationNotes: reservation.notes,
      propertyUnit: reservation.property.unit,
      currency: reservation.currency,
      hasQuote: reservation.hasQuote,
      adults: reservation.adults,
      children: reservation.children,
      infants: reservation.infants,
      pets: reservation.pets,
      stage: stageOf(reservation),
      opportunityStatus: reservation.opportunityStatus,
      lostReason: reservation.lostReason,
      quoteId: reservation.quotes[0]?.id,
      quoteNumber: reservation.quotes[0]?.number,
      quoteStatus: reservation.quotes[0]?.status,
      quoteItems: reservation.quotes[0]?.lines.map((line) => ({
        id: line.id,
        name: line.itemName,
        category: "product" as const,
        categoryLabel: line.categoryName,
        businessUnit: line.businessUnitName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.total,
      })),
    }));

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/oportunidades" />
      <OpportunitiesBoard
        seeds={opportunities}
        catalogItems={catalogItems.map((item) => ({ id: item.id, name: item.name, price: item.price, unit: item.unit, businessUnit: item.businessUnit.name, category: item.category?.name ?? "Sin categoría" }))}
      />
    </div>
  );
}
