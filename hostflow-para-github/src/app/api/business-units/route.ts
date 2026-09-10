import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const units = await db.businessUnit.findMany({
    where: { isActive: true },
    select: { id: true, name: true, color: true, type: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(units);
}
