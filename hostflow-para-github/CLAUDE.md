# hostflow

@AGENTS.md

## Qué es esto

SaaS de gestión de alquiler vacacional (property management: reservas, calendario multi-canal, huéspedes, web de reservas). Referencia de producto: Lodgify — David ya usa Lodgify hoy para su negocio real de glamping/hotel (propiedades tipo "Glamping Sol", "Glamping Luna", suites) y quiere:

1. Reemplazar esa herramienta con la suya propia para uso interno.
2. Eventualmente vender `hostflow` a otros anfitriones/gestores como producto.

No es un ejercicio de solo-UI: cada pantalla debe tener datos y lógica reales por detrás, no arrays hardcodeados de relleno. Cuando una pantalla replica una referencia visual de Lodgify, el copy/branding es propio de hostflow (ver límite legal abajo), pero los datos deben venir de la base de datos real del proyecto.

## Bug recurrente: Turbopack sirve código/CSS/cliente Prisma viejo

Pasó 3 veces (2026-07-14/15): tras editar `globals.css`, tras editar componentes, y tras `npx prisma generate` — Turbopack sigue sirviendo la versión compilada anterior en el dev server ya corriendo, causando errores tipo `ReferenceError`, `Currency code is required`, o `Unknown argument` de Prisma que en realidad ya no existen en el código fuente. **Antes de reportar un bug raro, verificar si es esto.** Fix probado: parar el servidor, mover `.next` (no borrar, por si acaso: `mv .next .next-stale-$(date +%s)`), reiniciar `npm run dev`. Regla práctica: **reiniciar el dev server siempre después de correr `npx prisma generate`**, no solo tras cambios de CSS.

## Límite legal (no negociable salvo que David lo cambie explícitamente)

No reproducir copy, fotos ni assets con derechos de autor de Lodgify. Sí se puede replicar estructura, layout, patrones UX y — con aprobación explícita de David (ya dada 2026-07-14) — paleta de color y tipografía muy cercanas a las suyas. Nunca usar nombres reales de huéspedes/clientes de la cuenta real de Lodgify de David en código, copy o datos semilla — son PII de terceros.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4
- Prisma 7 + SQLite (`@prisma/adapter-better-sqlite3`) para desarrollo local — base de datos real desde el día 1 (decisión 2026-07-14, para no bloquear "funcionalidad real" en que David cree cuentas externas)
  - **Prisma 7 breaking change:** la URL del datasource NO va en `schema.prisma` (falla `P1012`) — vive en `.env` (`DATABASE_URL="file:./dev.db"`, relativo a la raíz del proyecto) y se pasa como `adapter` al `PrismaClient` (ver `src/lib/db.ts`). El generator usa `output = "../src/generated/prisma"`, se importa como `@/generated/prisma/client`.
  - Cliente centralizado: `src/lib/db.ts` (exporta `db`, singleton en dev)
  - Seed reproducible con datos inventados: `prisma/seed.ts` — correr con `npx tsx prisma/seed.ts`. Acepta `SEED_VOLUME=demo|realistic|stress` o `30|150|500` (default `realistic`), `SEED_SEED=<entero>` (default `260715`) y `SEED_ANCHOR_DATE=<ISO>` (default `2026-07-15T12:00:00.000Z`). Ejemplo: `SEED_VOLUME=stress SEED_SEED=42 npx tsx prisma/seed.ts`. Genera 18 meses de estacionalidad, todas las etapas del pipeline, diez fuentes de marketing y conversaciones ficticias.
  - **Nunca usar nombres reales de huéspedes de la cuenta real de Lodgify de David en el seed ni en fixtures** — son PII de terceros
- Pendiente de conectar: Supabase/Postgres (cuando exista cuenta — migración: cambiar `provider` en `schema.prisma` + el adapter en `db.ts`/`seed.ts` de better-sqlite3 a pg), Stripe (billing), Vercel (deploy)
- Fuente tipográfica: Baloo 2 (display, redondeada bold) + Inter (texto)
- Paleta: negro `#111111` (`--ink`) / crema `#fdfcf8` (`--cream`) / amarillo `#f5e030` (`--coral`, el nombre de variable quedó de una iteración anterior con otra paleta, no renombrado aún)

## Modelo de datos (prisma/schema.prisma)

- `Property` (id, name, unit) — una unidad/alojamiento
- `Guest` (id, name, email)
- `Reservation` (property, guest, guestCount, checkIn, checkOut, channel, status y `stage`: INQUIRY/QUOTED/BOOKED/PAID/STAYING/COMPLETED/CANCELLED). `src/lib/pipeline.ts` es la taxonomía canónica; no crear taxonomías locales en UI.

## Estado actual (actualizado 2026-07-15)

- `/` — landing completa, 11 secciones, estilo negro/amarillo tipo Lodgify
- `/login` — login split-screen (form + panel de marca), sin auth real conectada todavía (el submit no hace nada — falta backend de auth)
- `/dashboard` — **funcional con datos reales**: sidebar + tabs (Próximas llegadas / Próximas salidas / Hospedados ahora) leyendo de SQLite vía Prisma, no arrays hardcodeados. `page.tsx` hace las queries (Server Component), `tables.tsx` es el client component de las tabs.
- Sin autenticación real, sin Stripe, sin deploy
- Siguiente pantalla lógica: `/dashboard/reservas` (lista completa + filtros) o conectar el login a auth real — sin decidir todavía, preguntar a David

## Convenciones

- Todo el copy en español (target: anfitriones hispanohablantes, empezando por el negocio de David)
- Componentes de página en Server Components por defecto; `"use client"` solo donde hay estado/interacción (ej. `/login` por el toggle de contraseña)
- Datos reales vía Prisma, nunca arrays hardcodeados una vez exista el modelo correspondiente

## Historial de decisiones relevantes

- 2026-07-14: nombre de trabajo `hostflow`, stack confirmado, ubicación `Portal/Proyectos/hostflow/` (venture separado de la agencia L&CS, modelo holding `Proyectos/<negocio>/`)
- 2026-07-14: David confirmó acercamiento visual máximo a Lodgify (negro+amarillo) asumiendo el riesgo de parecido de marca
- 2026-07-14: confirmado que hostflow es DOBLE propósito — herramienta real para el negocio de David + producto a vender

## Memoria más amplia (HIKARI)

Este proyecto también tiene nota de seguimiento en el vault HIKARI: `🧠 Hikari/🟡 Lóbulo Frontal/Proyectos/🖥 hostflow — Proyecto.md`. Ese archivo tiene contexto de negocio/estratégico; este `CLAUDE.md` tiene contexto técnico operativo. Mantener ambos sincronizados en decisiones grandes.
