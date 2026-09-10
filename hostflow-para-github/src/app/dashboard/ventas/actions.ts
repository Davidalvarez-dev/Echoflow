"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { runAutomations } from "@/lib/automation";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function number(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function refreshCommercial() {
  revalidatePath("/dashboard", "layout");
}

export async function createCatalogItem(formData: FormData) {
  const name = text(formData, "name");
  const businessUnitId = text(formData, "businessUnitId");
  const categoryId = text(formData, "categoryId") || null;
  const price = number(formData, "price");
  if (!name || !businessUnitId || price < 0) throw new Error("Datos de producto inválidos");

  await db.catalogItem.create({
    data: {
      name,
      sku: text(formData, "sku") || null,
      description: text(formData, "description") || null,
      type: text(formData, "type") as "ROOM" | "PRODUCT" | "SERVICE" | "PACKAGE",
      unit: text(formData, "unit") || "unidad",
      price,
      cost: number(formData, "cost"),
      taxRate: number(formData, "taxRate", 16) / 100,
      businessUnitId,
      categoryId,
    },
  });
  refreshCommercial();
}

export async function toggleCatalogItem(formData: FormData) {
  const id = text(formData, "id");
  const current = await db.catalogItem.findUnique({ where: { id }, select: { isActive: true } });
  if (!current) throw new Error("Producto no encontrado");
  await db.catalogItem.update({ where: { id }, data: { isActive: !current.isActive } });
  refreshCommercial();
}

export async function addPackageComponent(formData: FormData) {
  const packageId = text(formData, "packageId");
  const itemId = text(formData, "itemId");
  const quantity = Math.max(0.01, number(formData, "quantity", 1));
  if (!packageId || !itemId || packageId === itemId) throw new Error("Componente de paquete inválido");
  const packageItem = await db.catalogItem.findFirst({ where: { id: packageId, type: "PACKAGE" } });
  const item = await db.catalogItem.findUnique({ where: { id: itemId } });
  if (!packageItem || !item) throw new Error("Producto o paquete no encontrado");
  await db.packageComponent.upsert({
    where: { packageId_itemId: { packageId, itemId } },
    update: { quantity },
    create: { packageId, itemId, quantity },
  });
  refreshCommercial();
}

export async function createBusinessUnit(formData: FormData) {
  const name = text(formData, "name");
  if (!name) throw new Error("El nombre es obligatorio");
  await db.businessUnit.create({
    data: {
      name,
      type: text(formData, "type") as "LODGING" | "RESTAURANT" | "SPA" | "OTHER",
      color: text(formData, "color") || "#111111",
    },
  });
  refreshCommercial();
}

export async function createQuote(formData: FormData) {
  const guestId = text(formData, "guestId");
  const reservationId = text(formData, "reservationId") || null;
  if (!guestId) throw new Error("Selecciona un huésped");
  const count = await db.quote.count();
  await db.quote.create({
    data: {
      number: `COT-${String(count + 1).padStart(5, "0")}-${Date.now().toString().slice(-4)}`,
      guestId,
      reservationId,
      notes: text(formData, "notes") || null,
    },
  });
  refreshCommercial();
}

export async function addQuoteLine(formData: FormData) {
  const quoteId = text(formData, "quoteId");
  const itemId = text(formData, "itemId");
  const quantity = Math.max(0.01, number(formData, "quantity", 1));
  const [quote, item] = await Promise.all([
    db.quote.findUnique({ where: { id: quoteId }, include: { lines: true } }),
    db.catalogItem.findUnique({ where: { id: itemId }, include: { businessUnit: true, category: true } }),
  ]);
  if (!quote || !item) throw new Error("Cotización o producto no encontrado");
  const subtotal = Math.round(quantity * item.price * 100) / 100;
  const taxAmount = Math.round(subtotal * item.taxRate * 100) / 100;
  await db.quoteLine.create({
    data: {
      quoteId,
      itemId,
      businessUnitId: item.businessUnitId,
      itemName: item.name,
      businessUnitName: item.businessUnit.name,
      categoryName: item.category?.name ?? "Sin categoría",
      quantity,
      unit: item.unit,
      unitPrice: item.price,
      taxRate: item.taxRate,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
      position: quote.lines.length,
    },
  });
  await recalculateQuote(quoteId);
  refreshCommercial();
}

export async function removeQuoteLine(formData: FormData) {
  const id = text(formData, "id");
  const line = await db.quoteLine.findUnique({ where: { id }, select: { quoteId: true } });
  if (!line) return;
  await db.quoteLine.delete({ where: { id } });
  await recalculateQuote(line.quoteId);
  refreshCommercial();
}

export async function updateQuoteStatus(formData: FormData) {
  const id = text(formData, "id");
  const status = text(formData, "status") as "DRAFT" | "SENT" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  const quote = await db.quote.update({ where: { id }, data: { status } });
  if (status === "SENT" && quote.reservationId) await runAutomations("QUOTE_SENT", quote.reservationId);
  refreshCommercial();
}

async function recalculateQuote(id: string) {
  const lines = await db.quoteLine.findMany({ where: { quoteId: id } });
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const taxTotal = lines.reduce((sum, line) => sum + line.taxAmount, 0);
  await db.quote.update({ where: { id }, data: { subtotal, taxTotal, total: subtotal + taxTotal } });
}

async function ensureOpportunityQuote(reservationId: string) {
  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
    include: { quotes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!reservation) throw new Error("Oportunidad no encontrada");
  if (reservation.quotes[0]) return reservation.quotes[0];
  const count = await db.quote.count();
  return db.quote.create({
    data: {
      number: `COT-${String(count + 1).padStart(5, "0")}-${Date.now().toString().slice(-4)}`,
      guestId: reservation.guestId,
      reservationId,
      status: "DRAFT",
    },
  });
}

async function opportunityQuoteSnapshot(quoteId: string) {
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { lines: { orderBy: { position: "asc" } } },
  });
  if (!quote) throw new Error("Cotización no encontrada");
  return {
    quoteId: quote.id,
    quoteNumber: quote.number,
    quoteStatus: quote.status,
    total: quote.total,
    items: quote.lines.map((line) => ({
      id: line.id,
      name: line.itemName,
      category: "product" as const,
      categoryLabel: line.categoryName,
      businessUnit: line.businessUnitName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.total,
    })),
  };
}

async function syncOpportunityQuote(quoteId: string, reservationId: string) {
  await recalculateQuote(quoteId);
  const snapshot = await opportunityQuoteSnapshot(quoteId);
  await db.reservation.update({
    where: { id: reservationId },
    data: { hasQuote: true, totalAmount: snapshot.total },
  });
  refreshCommercial();
  return snapshot;
}

export async function addOpportunityQuoteLine(reservationId: string, itemId: string, quantity: number) {
  const safeQuantity = Math.max(0.01, Math.min(999, Number(quantity) || 1));
  const [quote, item] = await Promise.all([
    ensureOpportunityQuote(reservationId),
    db.catalogItem.findFirst({ where: { id: itemId, isActive: true }, include: { businessUnit: true, category: true } }),
  ]);
  if (!item) throw new Error("El producto ya no está disponible");
  const existing = await db.quoteLine.findFirst({ where: { quoteId: quote.id, itemId } });
  const nextQuantity = existing ? existing.quantity + safeQuantity : safeQuantity;
  const subtotal = Math.round(nextQuantity * item.price * 100) / 100;
  const taxAmount = Math.round(subtotal * item.taxRate * 100) / 100;
  if (existing) {
    await db.quoteLine.update({ where: { id: existing.id }, data: { quantity: nextQuantity, subtotal, taxAmount, total: subtotal + taxAmount } });
  } else {
    const position = await db.quoteLine.count({ where: { quoteId: quote.id } });
    await db.quoteLine.create({
      data: {
        quoteId: quote.id,
        itemId: item.id,
        businessUnitId: item.businessUnitId,
        itemName: item.name,
        businessUnitName: item.businessUnit.name,
        categoryName: item.category?.name ?? "Sin categoría",
        quantity: safeQuantity,
        unit: item.unit,
        unitPrice: item.price,
        taxRate: item.taxRate,
        subtotal: Math.round(safeQuantity * item.price * 100) / 100,
        taxAmount: Math.round(safeQuantity * item.price * item.taxRate * 100) / 100,
        total: Math.round(safeQuantity * item.price * (1 + item.taxRate) * 100) / 100,
        position,
      },
    });
  }
  return syncOpportunityQuote(quote.id, reservationId);
}

export async function updateOpportunityQuoteLine(reservationId: string, lineId: string, quantity: number) {
  const safeQuantity = Math.max(0.01, Math.min(999, Number(quantity) || 1));
  const line = await db.quoteLine.findFirst({ where: { id: lineId, quote: { reservationId } } });
  if (!line) throw new Error("Concepto no encontrado");
  const subtotal = Math.round(safeQuantity * line.unitPrice * (1 - line.discountPct / 100) * 100) / 100;
  const taxAmount = Math.round(subtotal * line.taxRate * 100) / 100;
  await db.quoteLine.update({ where: { id: line.id }, data: { quantity: safeQuantity, subtotal, taxAmount, total: subtotal + taxAmount } });
  return syncOpportunityQuote(line.quoteId, reservationId);
}

export async function removeOpportunityQuoteLine(reservationId: string, lineId: string) {
  const line = await db.quoteLine.findFirst({ where: { id: lineId, quote: { reservationId } } });
  if (!line) throw new Error("Concepto no encontrado");
  await db.quoteLine.delete({ where: { id: line.id } });
  return syncOpportunityQuote(line.quoteId, reservationId);
}

type PosEntry = { itemId: string; quantity: number };

export async function createPosSale(serializedCart: string) {
  let entries: PosEntry[] = [];
  try {
    entries = JSON.parse(serializedCart) as PosEntry[];
  } catch {
    throw new Error("Carrito inválido");
  }
  entries = entries.filter((entry) => entry.itemId && Number.isFinite(entry.quantity) && entry.quantity > 0).slice(0, 50);
  if (!entries.length) throw new Error("Agrega productos al carrito");
  const items = await db.catalogItem.findMany({
    where: { id: { in: entries.map((entry) => entry.itemId) }, isActive: true },
    include: { businessUnit: true, category: true },
  });
  const lines = entries.map((entry) => {
    const item = items.find((candidate) => candidate.id === entry.itemId);
    if (!item) throw new Error("Uno de los productos ya no está disponible");
    const subtotal = Math.round(entry.quantity * item.price * 100) / 100;
    const taxAmount = Math.round(subtotal * item.taxRate * 100) / 100;
    return {
      itemId: item.id,
      businessUnitId: item.businessUnitId,
      itemName: item.name,
      businessUnitName: item.businessUnit.name,
      categoryName: item.category?.name ?? "Sin categoría",
      quantity: entry.quantity,
      unit: item.unit,
      unitPrice: item.price,
      taxRate: item.taxRate,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const taxTotal = lines.reduce((sum, line) => sum + line.taxAmount, 0);
  const total = subtotal + taxTotal;
  const count = await db.sale.count();
  const sale = await db.sale.create({
    data: {
      number: `POS-${String(count + 1).padStart(5, "0")}-${Date.now().toString().slice(-4)}`,
      channel: "POS",
      status: "PAID",
      subtotal,
      taxTotal,
      total,
      paidAmount: total,
      lines: { create: lines },
    },
  });
  refreshCommercial();
  return { number: sale.number, total: sale.total };
}
