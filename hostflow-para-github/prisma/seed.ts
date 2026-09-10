import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

const volumeProfiles: Record<string, number> = { demo: 30, realistic: 150, stress: 500 };
const rawVolume = (process.env.SEED_VOLUME ?? "realistic").toLowerCase();
const numericVolume = Number(rawVolume);
const volume = volumeProfiles[rawVolume] ?? ([30, 150, 500].includes(numericVolume) ? numericVolume : 150);
const seedValue = Number(process.env.SEED_SEED ?? 260715) >>> 0;
const anchor = new Date(process.env.SEED_ANCHOR_DATE ?? "2026-07-15T12:00:00.000Z");

type Stage = "INQUIRY" | "QUOTED" | "BOOKED" | "PAID" | "STAYING" | "COMPLETED" | "LOST" | "ABANDONED" | "CANCELLED";
type Channel = "DIRECT" | "AIRBNB" | "BOOKING" | "VRBO";

function lineAmounts(quantity: number, unitPrice: number, taxRate = 0.16, discountPct = 0) {
  const subtotal = Math.round(quantity * unitPrice * (1 - discountPct / 100) * 100) / 100;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

function mulberry32(seed: number) {
  return () => {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const random = mulberry32(seedValue);

function integer(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick<T>(items: readonly T[]) {
  return items[Math.floor(random() * items.length)];
}

function weightedPick<T>(items: readonly { value: T; weight: number }[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function monthDate(offset: number) {
  const first = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + offset, 1, 18));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(integer(1, lastDay));
  return first;
}

const monthWeights = Array.from({ length: 18 }, (_, index) => {
  const offset = index - 12;
  const date = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + offset, 1));
  const month = date.getUTCMonth();
  const seasonalWeight = [1.35, 0.72, 0.82, 1.02, 0.88, 1.08, 1.52, 1.32, 0.78, 0.9, 1.08, 1.68][month];
  return { value: offset, weight: seasonalWeight };
});

const sourceDefinitions = [
  { source: "Instagram", channel: "DIRECT" },
  { source: "Facebook", channel: "DIRECT" },
  { source: "WhatsApp", channel: "DIRECT" },
  { source: "Google", channel: "DIRECT" },
  { source: "Recomendación", channel: "DIRECT" },
  { source: "Booking.com", channel: "BOOKING" },
  { source: "Airbnb", channel: "AIRBNB" },
  { source: "Vrbo", channel: "VRBO" },
  { source: "Sitio web", channel: "DIRECT" },
  { source: "Otro", channel: "DIRECT" },
] as const satisfies readonly { source: string; channel: Channel }[];

const propertySeed = [
  { name: "Domo Luna", unit: "Luna", nightlyRate: 580 },
  { name: "Domo Sol", unit: "Sol", nightlyRate: 740 },
  { name: "Domo Verano", unit: "Verano", nightlyRate: 790 },
  { name: "Glamping Invierno", unit: "Invierno", nightlyRate: 740 },
  { name: "Glamping Otoño", unit: "Otoño", nightlyRate: 740 },
  { name: "Suite Olivo", unit: "Olivo", nightlyRate: 900 },
  { name: "Suite Terrés", unit: "Terrés", nightlyRate: 1200 },
];

const firstNames = [
  "Andrea", "Bruno", "Camila", "Daniel", "Elena", "Fabian", "Gabriela", "Hugo", "Ines", "Javier",
  "Karla", "Leonardo", "Marina", "Nicolas", "Olivia", "Pablo", "Renata", "Santiago", "Tamara", "Victor",
];
const lastNames = ["Acosta", "Beltran", "Cervantes", "Dominguez", "Escalante", "Fuentes", "Galvan", "Herrera"];
const cities = ["León", "Ciudad de México", "Guadalajara", "Monterrey", "Querétaro", "Puebla", "Morelia", "Aguascalientes"];

function stageFor(checkIn: Date, checkOut: Date, index: number): Stage {
  const forced: Stage[] = ["INQUIRY", "QUOTED", "BOOKED", "PAID", "STAYING", "COMPLETED", "LOST", "ABANDONED", "CANCELLED"];
  if (index < forced.length) return forced[index];
  if (checkIn <= anchor && anchor < checkOut) return "STAYING";
  if (checkOut < anchor) return random() < 0.12 ? "CANCELLED" : "COMPLETED";
  return weightedPick<Stage>([
    { value: "INQUIRY", weight: 18 },
    { value: "QUOTED", weight: 22 },
    { value: "BOOKED", weight: 30 },
    { value: "PAID", weight: 24 },
    { value: "CANCELLED", weight: 6 },
    { value: "LOST", weight: 4 },
    { value: "ABANDONED", weight: 4 },
  ]);
}

function datesFor(index: number) {
  if (index < 4) {
    const checkIn = addDays(anchor, 20 + index * 9);
    return { checkIn, checkOut: addDays(checkIn, 2 + index) };
  }
  if (index === 4) return { checkIn: addDays(anchor, -1), checkOut: addDays(anchor, 2) };
  if (index === 5) return { checkIn: addDays(anchor, -45), checkOut: addDays(anchor, -42) };
  if (index === 6) return { checkIn: addDays(anchor, 55), checkOut: addDays(anchor, 58) };

  const checkIn = monthDate(weightedPick(monthWeights));
  return { checkIn, checkOut: addDays(checkIn, integer(1, 5)) };
}

async function main() {
  await db.saleLine.deleteMany();
  await db.sale.deleteMany();
  await db.quoteLine.deleteMany();
  await db.quote.deleteMany();
  await db.packageComponent.deleteMany();
  await db.catalogItem.deleteMany();
  await db.catalogCategory.deleteMany();
  await db.businessUnit.deleteMany();
  await db.message.deleteMany();
  await db.reservation.deleteMany();
  await db.guest.deleteMany();
  await db.property.deleteMany();

  const properties: { id: string; name: string; unit: string | null; nightlyRate: number }[] = [];
  for (const property of propertySeed) {
    properties.push(await db.property.create({ data: property }));
  }

  const lodging = await db.businessUnit.create({
    data: { name: "Hospedaje", type: "LODGING", color: "#2468ec" },
  });
  const restaurant = await db.businessUnit.create({
    data: { name: "Restaurante", type: "RESTAURANT", color: "#dd5b3f" },
  });
  const spa = await db.businessUnit.create({
    data: { name: "Spa", type: "SPA", color: "#0f7657" },
  });

  const roomCategory = await db.catalogCategory.create({ data: { name: "Habitaciones", businessUnitId: lodging.id } });
  const lodgingServices = await db.catalogCategory.create({ data: { name: "Servicios de estancia", businessUnitId: lodging.id } });
  const packagesCategory = await db.catalogCategory.create({ data: { name: "Paquetes", businessUnitId: lodging.id } });
  const foodCategory = await db.catalogCategory.create({ data: { name: "Alimentos", businessUnitId: restaurant.id } });
  const drinksCategory = await db.catalogCategory.create({ data: { name: "Bebidas", businessUnitId: restaurant.id } });
  const treatmentsCategory = await db.catalogCategory.create({ data: { name: "Tratamientos", businessUnitId: spa.id } });

  const catalogItems: { id: string; name: string; price: number; taxRate: number; businessUnitId: string; categoryName: string; unit: string }[] = [];
  for (const property of properties) {
    const item = await db.catalogItem.create({
      data: {
        name: property.name,
        sku: `ROOM-${property.unit?.toUpperCase() ?? property.id.slice(-5)}`,
        description: "Noche de hospedaje",
        type: "ROOM",
        unit: "noche",
        price: property.nightlyRate,
        cost: property.nightlyRate * 0.32,
        taxRate: 0.16,
        businessUnitId: lodging.id,
        categoryId: roomCategory.id,
        propertyId: property.id,
      },
    });
    catalogItems.push({ ...item, categoryName: roomCategory.name });
  }

  const extraItemSeeds = [
    { name: "Limpieza de habitación", sku: "HOS-LIMPIEZA", type: "SERVICE", unit: "servicio", price: 360, cost: 140, taxRate: 0.16, businessUnitId: lodging.id, categoryId: lodgingServices.id, categoryName: lodgingServices.name },
    { name: "Cena romántica", sku: "RES-CENA-ROM", type: "SERVICE", unit: "pareja", price: 1350, cost: 560, taxRate: 0.16, businessUnitId: restaurant.id, categoryId: foodCategory.id, categoryName: foodCategory.name },
    { name: "Desayuno campestre", sku: "RES-DESAYUNO", type: "PRODUCT", unit: "persona", price: 290, cost: 115, taxRate: 0.16, businessUnitId: restaurant.id, categoryId: foodCategory.id, categoryName: foodCategory.name },
    { name: "Botella de vino de la casa", sku: "RES-VINO-CASA", type: "PRODUCT", unit: "botella", price: 520, cost: 210, taxRate: 0.16, businessUnitId: restaurant.id, categoryId: drinksCategory.id, categoryName: drinksCategory.name },
    { name: "Masaje relajante 60 min", sku: "SPA-MAS-60", type: "SERVICE", unit: "sesión", price: 1100, cost: 430, taxRate: 0.16, businessUnitId: spa.id, categoryId: treatmentsCategory.id, categoryName: treatmentsCategory.name },
    { name: "Ritual de pareja", sku: "SPA-RIT-PAR", type: "SERVICE", unit: "pareja", price: 2100, cost: 820, taxRate: 0.16, businessUnitId: spa.id, categoryId: treatmentsCategory.id, categoryName: treatmentsCategory.name },
  ] as const;
  for (const seed of extraItemSeeds) {
    const { categoryName, ...data } = seed;
    const item = await db.catalogItem.create({ data });
    catalogItems.push({ ...item, categoryName });
  }

  const romanticPackage = await db.catalogItem.create({
    data: {
      name: "Escapada romántica",
      sku: "PAQ-ROMANTICA",
      description: "Cena, vino y masaje para dos personas",
      type: "PACKAGE",
      unit: "paquete",
      price: 3490,
      cost: 1590,
      taxRate: 0.16,
      businessUnitId: lodging.id,
      categoryId: packagesCategory.id,
    },
  });
  catalogItems.push({ ...romanticPackage, categoryName: packagesCategory.name });
  const packageParts = catalogItems.filter((item) => ["Cena romántica", "Botella de vino de la casa", "Masaje relajante 60 min"].includes(item.name));
  for (const item of packageParts) {
    await db.packageComponent.create({ data: { packageId: romanticPackage.id, itemId: item.id, quantity: 1 } });
  }

  const guests: { id: string }[] = [];
  for (let index = 0; index < 40; index += 1) {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    guests.push(await db.guest.create({
      data: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email: `guest${String(index + 1).padStart(2, "0")}@example.test`,
        phone: `+52 555 010 ${String(1000 + index).slice(-4)}`,
        location: cities[index % cities.length],
        country: "México",
        language: index % 8 === 0 ? "English" : "Español",
      },
    }));
  }

  const stageTotals: Record<Stage, number> = {
    INQUIRY: 0, QUOTED: 0, BOOKED: 0, PAID: 0, STAYING: 0, COMPLETED: 0, LOST: 0, ABANDONED: 0, CANCELLED: 0,
  };

  for (let index = 0; index < volume; index += 1) {
    const property = pick(properties);
    const guest = pick(guests);
    const source = sourceDefinitions[index < sourceDefinitions.length ? index : integer(0, sourceDefinitions.length - 1)];
    const { checkIn, checkOut } = datesFor(index);
    const stage = stageFor(checkIn, checkOut, index);
    const opportunityStatus = stage === "COMPLETED" ? "WON" : stage === "LOST" ? "LOST" : stage === "ABANDONED" || stage === "CANCELLED" ? "ABANDONED" : "OPEN";
    const pipelineStage = stage === "INQUIRY" || stage === "QUOTED" || stage === "BOOKED" || stage === "STAYING" ? stage : "BOOKED";
    const lostReason = stage === "LOST" ? pick(["Precio o presupuesto", "Eligió otra opción", "Fechas no disponibles", "No respondió"]) : null;
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
    const seasonalMultiplier = [1.2, 0.9, 0.95, 1.05, 1, 1.1, 1.35, 1.25, 0.92, 1, 1.08, 1.45][checkIn.getUTCMonth()];
    const stayAmount = Math.round(property.nightlyRate * nights * seasonalMultiplier / 10) * 10;
    const cleaning = 360;
    const totalAmount = Math.round((stayAmount + cleaning) * 1.16 / 10) * 10;
    const paidAmount = stage === "PAID"
      ? Math.round(totalAmount * pick([0.3, 0.5, 0.75, 1]) / 10) * 10
      : stage === "STAYING" || stage === "COMPLETED"
        ? totalAmount
        : 0;
    const status = stage === "CANCELLED" ? "CANCELLED" : stage === "COMPLETED" ? "COMPLETED" : "CONFIRMED";
    const guestCount = integer(1, 5);
    const createdAt = addDays(checkIn, -integer(7, 100));
    if (createdAt > anchor) createdAt.setTime(addDays(anchor, -integer(0, 12)).getTime());

    const reservation = await db.reservation.create({
      data: {
        propertyId: property.id,
        guestId: guest.id,
        guestCount,
        adults: Math.max(1, guestCount - (random() < 0.35 ? 1 : 0)),
        children: guestCount > 2 && random() < 0.35 ? 1 : 0,
        infants: random() < 0.08 ? 1 : 0,
        pets: random() < 0.12 ? 1 : 0,
        source: source.source,
        hasQuote: !["INQUIRY", "ABANDONED", "CANCELLED"].includes(stage),
        checkIn,
        checkOut,
        channel: source.channel,
        status,
        stage: pipelineStage,
        opportunityStatus,
        lostReason,
        statusChangedAt: opportunityStatus === "OPEN" ? null : createdAt,
        totalAmount,
        paidAmount,
        notes: random() < 0.3 ? pick(["Celebración especial", "Llegada después de las 20:00", "Solicita opción vegetariana", "Prefiere contacto por WhatsApp"]) : null,
        createdAt,
      },
    });

    stageTotals[stage] += 1;
    const messageCount = integer(2, 6);
    const guestMessages = [
      "Hola, quisiera confirmar disponibilidad y políticas de llegada.",
      "¿La tarifa incluye limpieza e impuestos?",
      "Gracias, quedo pendiente de la cotización.",
      "Perfecto, estos datos funcionan para nuestro viaje.",
    ];
    const hostMessages = [
      "Con gusto. Te comparto los detalles de la estancia.",
      "La cotización muestra cada concepto y el saldo pendiente.",
      "Tu solicitud quedó registrada; te avisaremos cualquier cambio.",
    ];
    const systemMessages = [
      "Cotización creada para esta solicitud.",
      "Fechas de estancia actualizadas.",
      "Seguimiento automático programado.",
    ];
    for (let messageIndex = 0; messageIndex < messageCount; messageIndex += 1) {
      const author = messageIndex % 5 === 4 ? "SYSTEM" : messageIndex % 2 === 0 ? "GUEST" : "HOST";
      await db.message.create({
        data: {
          reservationId: reservation.id,
          author,
          body: author === "GUEST" ? pick(guestMessages) : author === "HOST" ? pick(hostMessages) : pick(systemMessages),
          createdAt: addDays(createdAt, messageIndex),
        },
      });
    }

    if (!["INQUIRY", "ABANDONED", "CANCELLED"].includes(stage)) {
      const roomItem = catalogItems.find((item) => item.name === property.name)!;
      const cleaningItem = catalogItems.find((item) => item.name === "Limpieza de habitación")!;
      const optionalItems = catalogItems.filter((item) => ["Cena romántica", "Desayuno campestre", "Masaje relajante 60 min", "Escapada romántica"].includes(item.name));
      const selectedExtras = random() < 0.62 ? [pick(optionalItems)] : [];
      if (random() < 0.18) selectedExtras.push(pick(optionalItems));
      const selected = [
        { item: roomItem, quantity: nights, unitPrice: Math.round(stayAmount / nights) },
        { item: cleaningItem, quantity: 1, unitPrice: cleaningItem.price },
        ...selectedExtras.map((item) => ({ item, quantity: item.name === "Desayuno campestre" ? guestCount : 1, unitPrice: item.price })),
      ];
      const lineData = selected.map(({ item, quantity, unitPrice }, position) => {
        const amounts = lineAmounts(quantity, unitPrice, item.taxRate);
        const unitName = item.businessUnitId === lodging.id ? "Hospedaje" : item.businessUnitId === restaurant.id ? "Restaurante" : "Spa";
        return {
          itemId: item.id,
          businessUnitId: item.businessUnitId,
          itemName: item.name,
          businessUnitName: unitName,
          categoryName: item.categoryName,
          quantity,
          unit: item.unit,
          unitPrice,
          taxRate: item.taxRate,
          position,
          ...amounts,
        };
      });
      const subtotal = lineData.reduce((sum, line) => sum + line.subtotal, 0);
      const taxTotal = lineData.reduce((sum, line) => sum + line.taxAmount, 0);
      const quoteTotal = subtotal + taxTotal;
      const quote = await db.quote.create({
        data: {
          number: `COT-${String(index + 1).padStart(5, "0")}`,
          status: stage === "QUOTED" ? "SENT" : "ACCEPTED",
          guestId: guest.id,
          reservationId: reservation.id,
          subtotal,
          taxTotal,
          total: quoteTotal,
          expiresAt: addDays(createdAt, 7),
          lines: { create: lineData },
        },
      });

      if (["BOOKED", "PAID", "STAYING", "COMPLETED"].includes(stage)) {
        const saleStatus = ["PAID", "STAYING", "COMPLETED"].includes(stage) ? "PAID" : "PENDING";
        await db.sale.create({
          data: {
            number: `VEN-${String(index + 1).padStart(5, "0")}`,
            status: saleStatus,
            channel: source.channel === "DIRECT" ? "PLATFORM" : "OTA",
            quoteId: quote.id,
            guestId: guest.id,
            reservationId: reservation.id,
            subtotal,
            taxTotal,
            total: quoteTotal,
            paidAmount: saleStatus === "PAID" ? quoteTotal : paidAmount,
            createdAt,
            lines: {
              create: lineData.map(({ position, ...line }) => {
                void position;
                return line;
              }),
            },
          },
        });
      }
    }
  }

  console.log(`Seed listo: ${properties.length} propiedades, ${catalogItems.length} productos, ${guests.length} huéspedes, ${volume} reservas`);
  console.log(`Semilla ${seedValue}; ancla ${anchor.toISOString()}; etapas ${JSON.stringify(stageTotals)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
