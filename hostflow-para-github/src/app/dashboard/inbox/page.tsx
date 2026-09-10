import { db } from "@/lib/db";
import { stageOf } from "@/lib/pipeline";
import { Sidebar } from "../sidebar";
import { InboxThread, type Conversation } from "./thread";

export const dynamic = "force-dynamic";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ reservation?: string }>;
}) {
  const { reservation: requestedReservation } = await searchParams;
  const [reservations, catalogItems] = await Promise.all([
    db.reservation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        guest: true,
        property: true,
        messages: { orderBy: { createdAt: "asc" } },
        quotes: { include: { lines: { orderBy: { position: "asc" } } }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      take: 30,
    }),
    db.catalogItem.findMany({ where: { isActive: true }, include: { businessUnit: true, category: true }, orderBy: { name: "asc" } }),
  ]);

  const conversations: Conversation[] = reservations.map((r) => ({
    id: r.id,
    status: r.status,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    guestCount: r.guestCount,
    notes: r.notes,
    opportunity: {
      value: r.totalAmount,
      paidAmount: r.paidAmount,
      channel: r.channel,
      hasQuote: r.hasQuote,
      source: r.source,
      currency: r.currency,
      adults: r.adults,
      children: r.children,
      infants: r.infants,
      pets: r.pets,
      stage: stageOf(r),
      quoteId: r.quotes[0]?.id,
      quoteNumber: r.quotes[0]?.number,
      quoteStatus: r.quotes[0]?.status,
      quoteItems: r.quotes[0]?.lines.map((line) => ({
        id: line.id,
        name: line.itemName,
        category: "product" as const,
        categoryLabel: line.categoryName,
        businessUnit: line.businessUnitName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.total,
      })),
    },
    guest: {
      name: r.guest.name,
      email: r.guest.email,
      phone: r.guest.phone,
      country: r.guest.country,
      language: r.guest.language,
    },
    property: { name: r.property.name, unit: r.property.unit },
    messages: r.messages.map((m) => ({
      id: m.id,
      author: m.author,
      body: m.body,
      createdAt: m.createdAt,
    })),
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/inbox" />
      <main className="min-h-0 flex-1 overflow-hidden">
        <InboxThread
          conversations={conversations}
          initialConversationId={requestedReservation}
          catalogItems={catalogItems.map((item) => ({ id: item.id, name: item.name, price: item.price, unit: item.unit, businessUnit: item.businessUnit.name, category: item.category?.name ?? "Sin categoría" }))}
        />
      </main>
    </div>
  );
}
