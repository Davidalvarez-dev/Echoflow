import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

async function main() {
  const properties = await db.property.findMany({ orderBy: { name: "asc" } });
  const rates = [580, 740, 790, 900, 1200];
  for (let i = 0; i < properties.length; i++) {
    await db.property.update({
      where: { id: properties[i].id },
      data: { nightlyRate: rates[i % rates.length] },
    });
  }
  console.log(`Tarifas actualizadas para ${properties.length} propiedades.`);
}

main().finally(() => db.$disconnect());
