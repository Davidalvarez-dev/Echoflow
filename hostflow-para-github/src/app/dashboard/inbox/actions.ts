"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData: FormData) {
  const reservationId = String(formData.get("reservationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!reservationId || !body) return;

  await db.message.create({
    data: { reservationId, author: "HOST", body },
  });

  revalidatePath("/dashboard/inbox");
}

export async function updateNotes(formData: FormData) {
  const reservationId = String(formData.get("reservationId") ?? "");
  const notes = String(formData.get("notes") ?? "");
  if (!reservationId) return;

  await db.reservation.update({
    where: { id: reservationId },
    data: { notes },
  });

  revalidatePath("/dashboard/inbox");
}
