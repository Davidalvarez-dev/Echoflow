import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

async function main() {
  const reservations = await db.reservation.findMany({
    include: { guest: true, messages: true },
  });

  for (const r of reservations) {
    if (r.messages.length > 0) continue;
    const firstName = r.guest.name.split(" ")[0];
    await db.message.createMany({
      data: [
        {
          reservationId: r.id,
          author: "SYSTEM",
          body: `Reserva confirmada (#${r.id.slice(0, 8).toUpperCase()})`,
        },
        {
          reservationId: r.id,
          author: "GUEST",
          body: `Hola, soy ${firstName}. ¿A qué hora puedo hacer check-in?`,
        },
        {
          reservationId: r.id,
          author: "HOST",
          body: "¡Hola! El check-in es a partir de las 3pm, te esperamos.",
        },
      ],
    });
  }

  console.log(`Mensajes agregados a ${reservations.length} reservas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
