import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runAutomations } from "@/lib/automation";

export async function POST() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  const arrivals = await db.reservation.findMany({ where: { checkIn: { gte: from, lt: to }, opportunityStatus: "OPEN" }, select: { id: true } });
  await Promise.all(arrivals.map((reservation) => runAutomations("CHECK_IN_DATE_REACHED", reservation.id)));
  return NextResponse.json({ processed: arrivals.length });
}
