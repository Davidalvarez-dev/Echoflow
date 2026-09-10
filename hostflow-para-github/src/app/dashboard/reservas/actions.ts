"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createReservation(formData: FormData) {
  const propertyId = String(formData.get("propertyId") ?? "");
  const checkIn = String(formData.get("checkIn") ?? "");
  const checkOut = String(formData.get("checkOut") ?? "");
  const source = String(formData.get("source") ?? "").trim();
  const hasQuote = String(formData.get("hasQuote") ?? "false") === "true";

  const adults = Number(formData.get("adults") ?? 1);
  const children = Number(formData.get("children") ?? 0);
  const infants = Number(formData.get("infants") ?? 0);
  const pets = Number(formData.get("pets") ?? 0);

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const guestEmail = String(formData.get("guestEmail") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  const phoneCode = String(formData.get("phoneCode") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();

  const channel = String(formData.get("channel") ?? "DIRECT");
  const totalAmount = Number(formData.get("totalAmount") ?? 0);

  if (!propertyId || !firstName || !lastName || !checkIn || !checkOut) {
    throw new Error("Faltan campos obligatorios");
  }

  const guest = await db.guest.create({
    data: {
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email: guestEmail || null,
      phone: phoneNumber ? `${phoneCode} ${phoneNumber}`.trim() : null,
      country: country || null,
      language: language || null,
    },
  });

  await db.reservation.create({
    data: {
      propertyId,
      guestId: guest.id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestCount: adults + children + infants,
      adults,
      children,
      infants,
      pets,
      source: source || null,
      hasQuote,
      channel: channel as "DIRECT" | "AIRBNB" | "BOOKING" | "VRBO",
      totalAmount: totalAmount || 0,
      paidAmount: 0,
    },
  });

  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard");
}
