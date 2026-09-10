# Brief para Codex — Unificar el dashboard con sus fuentes + tiempo + mock de datos

> Autor: HIKARI (Claude) · Fecha: 2026-07-15 · Para: Codex
> Repo: `Portal/Proyectos/hostflow/` · Stack: Next.js 16 (App Router) + Prisma 7 + SQLite
> **Antes de tocar código:** leer `CLAUDE.md`, `AGENTS.md` y `node_modules/next/dist/docs/` (Next 16 tiene breaking changes). Reiniciar el dev server tras cada `npx prisma generate`.

---

## 0. Objetivo (en una frase)

El dashboard debe ser **el reflejo agregado y coherente** de lo que vive en Reservas, Calendario, Bandeja y Oportunidades — hoy no lo es porque cada pantalla reinventa por su cuenta la "etapa" y el "tiempo". Hay que: **(1)** unificar la fuente de la etapa/pipeline, **(2)** hacer que el filtro de tiempo del dashboard realmente filtre todo con una semántica clara, y **(3)** generar un mock de datos rico y manipulable para poder probar qué funciona.

---

## 1. Diagnóstico — cómo se relacionan hoy las pantallas

**La buena noticia:** ya existe una fuente única de verdad. Las 5 pantallas leen de la **misma tabla `Reservation`** (`prisma/schema.prisma`) vía `db.reservation.findMany`. No hay data duplicada en DB.

```
                      ┌─────────────────────────────────────────┐
                      │   Reservation  (+ Guest, Property,       │
                      │   Message)  ← ÚNICA fuente de verdad     │
                      └───────────────────┬─────────────────────┘
        ┌──────────────┬──────────────────┼──────────────────┬───────────────────┐
        ▼              ▼                   ▼                  ▼                   ▼
   RESERVAS        CALENDARIO           BANDEJA          OPORTUNIDADES        DASHBOARD
   lista cruda   estancias en grid   Reservation +      Reservation como     agregados
   (tabla)       por propiedad       Messages (chat)    "deal" de pipeline   (donuts/funnel/
   take:30       ventana 14 días     take:30            con `stage`          histórico)
                 filtra por fecha ✅  order updatedAt    order createdAt      lee TODAS
```

**El problema raíz:** cada lente deriva por su cuenta dos cosas que deberían ser únicas — **la etapa del ciclo de vida** y **el recorte de tiempo** — y lo hace distinto en cada archivo. Una `Reservation` ES la oportunidad en distintos momentos de su vida (consulta → cotización → reservada → pagada → completada / cancelada). Eso debería definirse **una vez** y consumirse en todas partes.

### Defectos confirmados en código (con referencias)

**D1 — La "etapa" se inventa en 4 lugares distintos e incompatibles.** No existe campo `stage` en el schema; cada pantalla lo calcula a mano:
- `src/app/dashboard/oportunidades/page.tsx`: etapas `new/contacted/interested/quote/booked`, y la etapa temprana se asigna con **`earlyStages[index % 3]`** → es prácticamente **aleatoria**, no refleja nada real.
- `src/app/dashboard/inbox/page.tsx`: solo 3 etapas `contacted/quote/booked`, con default distinto (`contacted`).
- `src/app/dashboard/analytics-dashboard.tsx`: usa un vocabulario **totalmente distinto** — `Abiertas/Ganadas/Completadas/Perdidas` (donut) **y** `Nueva consulta/Cotización enviada/Reservada/Pagada` (embudo).
- Resultado: 3–4 taxonomías que no coinciden entre sí. El usuario no puede confiar en ninguna.

**D2 — El histórico ignora el filtro de tiempo → contradicción visual (la que David detectó).** En `analytics-dashboard.tsx`, `<ReservationHistory reservations={reservations} />` recibe **`reservations` (TODAS)**, mientras el resto de widgets usan **`filtered`** (recortado por `range.from/range.to`). Por eso con "Últimos 30 días" el resto muestra 1 y el histórico muestra 7–8: **dos escalas de tiempo distintas en la misma pantalla, sin avisar.** No es mock vs real; es filtrado vs sin filtrar.

**D3 — Dos widgets son idénticos.** Los paneles `dashboard.status` ("Estado de oportunidades") y `dashboard.stageDistribution` ("Distribución por etapa") renderizan **el mismo `metrics.statusSlices` y el mismo `Donut`**. Es el mismo dato dos veces.

**Secundarios (confirmados):**
- **Canal ambiguo:** el dashboard atribuye canal mapeando el string libre `source` a 10 canales de marketing (`reservationChannel()`), pero Calendario/Reservas usan el enum `channel` (solo 4 OTAs: DIRECT/AIRBNB/BOOKING/VRBO). Dos conceptos de "canal" que no cuadran.
- **"Próximas estancias" incluye fechas pasadas:** es `filtered.slice(0, 4)` sobre una lista ordenada por `checkIn desc`; nunca filtra `checkIn >= hoy`. Por eso aparece "14 jul" (ayer) como "próxima".
- **Embudo cosmético:** `quoted = Math.max(booked, hasQuote)` fuerza monotonía; el "Siguiente paso %" es `value/maxFunnel`, no una tasa de conversión real entre etapas.
- **Formato de % mixto:** conviven `100%` y `100.0%`.

---

## 2. Qué construir

### 2.1 — Fuente única para la etapa del pipeline (resuelve D1 y D3)

Definir **una sola taxonomía canónica** del ciclo de vida de una reserva/oportunidad y usarla en las 4 pantallas + dashboard.

Taxonomía propuesta (ajústala con David si hace falta, pero que sea UNA):

| Etapa | Significado | Cómo se detecta hoy |
|---|---|---|
| `INQUIRY` (Nueva consulta) | Llegó interés, sin cotización | reserva sin `hasQuote` y sin pago |
| `QUOTED` (Cotización enviada) | Se mandó precio | `hasQuote = true`, sin pago |
| `BOOKED` (Reservada) | Confirmada, sin pagar aún | `status = CONFIRMED`, `paidAmount = 0` |
| `PAID` (Pagada) | Con pago (total o anticipo) | `paidAmount > 0` |
| `STAYING` (Hospedado ahora) | Estancia en curso | `checkIn <= hoy < checkOut` |
| `COMPLETED` (Completada) | Estancia terminada | `status = COMPLETED` o `checkOut < hoy` |
| `CANCELLED` (Perdida) | Cancelada | `status = CANCELLED` |

**Implementación (elige, recomiendo la opción B):**
- **Opción A (mínima):** una función pura central `stageOf(reservation): Stage` en `src/lib/pipeline.ts`, más `STAGE_LABELS` (es/en) y `STAGE_ORDER`. Las 4 pantallas y el dashboard importan de ahí. Borra las 3 derivaciones locales. Rápido, sin migración.
- **Opción B (recomendada, "funcionalidad real" que David pidió):** además de `stageOf()`, **persistir** un campo `stage` (enum) en `Reservation`. El tablero de Oportunidades (kanban) puede **moverla** y eso escribe en DB (server action). Dashboard/Inbox leen ese campo. `stageOf()` se usa solo para derivar el valor inicial en el seed y como fallback. Requiere migración Prisma + reiniciar dev server.
- En ambos casos: **un solo Donut de estado en el dashboard** (eliminar el panel duplicado `stageDistribution`, o reconvertirlo en algo distinto de verdad — p. ej. distribución por **canal** o por **propiedad**, que sí aporta).

### 2.2 — Semántica única de tiempo (resuelve D2)

El filtro de fecha debe (a) aplicar a **todos** los widgets, incluido el histórico, y (b) dejar claro **por qué fecha** filtra. En hospitality hay dos preguntas distintas:

- **"¿Cuánta venta entró?"** → medir por **fecha de reserva** (`createdAt`).
- **"¿Quién llega / ocupación?"** → medir por **fecha de estancia** (`checkIn`/solape con la ventana).

Propuesta:
1. Un único control de rango global (el `DateRangePicker` ya existe) + un **toggle "Medir por: Reserva | Estancia"**.
2. Calcular `filtered` una sola vez con esa semántica y pasarlo a **todos** los widgets — incluido `<ReservationHistory>` (hoy recibe `reservations`; debe recibir `filtered`). El histórico deja de tener su propio selector de año aislado: su granularidad (día/semana/mes) se deriva del rango elegido.
3. Presets útiles para David: `Hoy`, `Próximos 7 días` (operativo), `Este mes`, `Últimos 30 días`, `Este año`, `Custom`. Los presets "próximos" solo tienen sentido en modo Estancia — deshabilitar el que no aplique según el toggle.
4. Mostrar el rango activo en texto ("1–31 jul, por fecha de estancia") para que nunca haya ambigüedad.

### 2.3 — Corregir métricas puntuales
- **Próximas estancias:** filtrar `checkIn >= hoy`, ordenar `checkIn asc`, tomar 4. (Hoy muestra pasadas.)
- **Embudo:** que las etapas usen la taxonomía de 2.1 y que el "%" sea conversión real entre etapa N y N-1 (`value[N] / value[N-1]`), no `value/max`.
- **Canal:** decidir una sola definición. Recomiendo elevar `source`/canal a un enum de marketing unificado (o al menos derivar SIEMPRE con la misma función en todas las pantallas). Documentar la diferencia entre "canal OTA" (dónde se hospeda la reserva) y "origen de marketing" (de dónde vino el lead) si se quieren ambos.
- **Formato %:** un solo helper (`pct(n)`), un decimal en todo.

### 2.4 — Widgets configurables
El botón "⌘ Configurar" por panel hoy no hace nada. No es prioridad de este brief, pero al deduplicar `stageDistribution` considera dejar ese slot como "panel configurable" real (elige métrica) en una iteración futura. Por ahora: quitar el duplicado.

---

## 3. Mock de datos manipulable (lo que David pidió para "ver qué funciona")

El seed actual (`prisma/seed.ts`) crea **5 reservas** todas cerca de hoy → ningún widget se llena, el histórico no tiene forma y el filtro de tiempo no cambia nada visible. Reescribir el seed para que **cada widget cobre vida y el filtro de tiempo se note al moverlo.**

**Requisitos del nuevo seed:**
- **Volumen y dispersión temporal:** ~120–180 reservas repartidas en **~18 meses** (12 hacia atrás + 6 hacia delante desde hoy). Con **estacionalidad** (picos en vacaciones: jul–ago y dic) para que el histórico tenga curva real.
- **Todas las etapas representadas:** mezcla realista de `INQUIRY/QUOTED/BOOKED/PAID/STAYING/COMPLETED/CANCELLED` (p. ej. ~15% consultas, ~15% cotizadas, ~20% reservadas, ~25% pagadas, ~15% completadas, ~10% canceladas), coherente con las fechas (las pasadas tienden a completed/cancelled, las futuras a booked/paid, algunas "staying" que solapen hoy).
- **Canales variados:** poblar los 10 canales de marketing (instagram, facebook, whatsapp, google, referral, web/direct, booking, airbnb, vrbo, other) vía `source`, y el enum `channel` coherente.
- **Montos realistas:** `totalAmount`/`paidAmount` en MXN acordes a `nightlyRate × noches`; anticipos parciales en algunas (`paidAmount` entre 30–100% del total).
- **Huéspedes y propiedades:** ~40 huéspedes inventados (nombres MX ficticios) sobre las 5 propiedades existentes (Domo Sol/Luna/Verano, Suite Terrés/Olivo) — o ampliar a 6–8 unidades. **Nunca usar nombres reales de la cuenta Lodgify de David (PII de terceros).**
- **Conversaciones para la Bandeja:** que un buen % de reservas tengan hilo de `Message` (HOST/GUEST/SYSTEM), 2–6 mensajes, para que el inbox no esté vacío.
- **Manipulable / idempotente:** parametrizar por variable de entorno, p. ej. `SEED_VOLUME=demo|realistic|stress` (30 / 150 / 500 reservas) y `SEED_SEED=<n>` para reproducibilidad (usar un PRNG con semilla, no `Math.random` puro, así David puede regenerar el mismo set). El seed debe limpiar y recrear (ya hace `deleteMany`). Documentar en `CLAUDE.md` cómo correrlo y tweakearlo.

Objetivo práctico: David corre `SEED_VOLUME=realistic npx tsx prisma/seed.ts`, abre el dashboard, **mueve el rango de fechas y ve los números cambiar de forma coherente en TODOS los widgets** — esa es la prueba de que la unificación funciona.

---

## 4. Criterios de aceptación

1. Existe **una sola** definición de etapa (`src/lib/pipeline.ts`); Oportunidades, Bandeja y Dashboard la consumen. No queda ningún `index % ...` ni taxonomía local.
2. Cambiar el rango de fechas en el dashboard actualiza **todos** los widgets, **incluido el histórico**. No hay dos escalas de tiempo simultáneas sin avisar.
3. El toggle "Reserva | Estancia" cambia la semántica y se refleja en texto visible del rango activo.
4. No hay dos paneles mostrando el mismo dato (se eliminó/reconvirtió el duplicado).
5. "Próximas estancias" solo muestra `checkIn >= hoy`.
6. El seed `realistic` llena todos los widgets con curva estacional y todas las etapas; mover el rango cambia los números de forma consistente.
7. Los números del Dashboard cuadran con los que se ven entrando a Reservas/Calendario/Bandeja/Oportunidades para el mismo rango.
8. Sin PII real de terceros en el seed.

---

## 5. Orden de ejecución sugerido

1. `src/lib/pipeline.ts` (taxonomía + `stageOf` + labels) y refactor de las 3 derivaciones locales para consumirla. *(desbloquea todo)*
2. Reescribir `prisma/seed.ts` (volumen, estacionalidad, etapas, canales, mensajes, parametrizable). *(permite ver el efecto de lo demás)*
3. Unificar tiempo en `analytics-dashboard.tsx`: pasar `filtered` al histórico + toggle Reserva/Estancia + presets.
4. Deduplicar/reconvertir `stageDistribution`; arreglar "Próximas" (fecha), embudo (% real) y formato de %.
5. (Opción B) Migración Prisma para persistir `stage` + server action del kanban de Oportunidades.

---

## Restricciones
- Leer `AGENTS.md`/docs de Next 16 antes de escribir. Reiniciar dev server tras `npx prisma generate` (bug recurrente de Turbopack sirviendo cliente viejo — ver `CLAUDE.md`).
- No PII real de la cuenta Lodgify de David en seed/fixtures.
- No conectar Supabase/Stripe/deploy en este brief — es trabajo local sobre SQLite.
- Devolver una CHANGE NOTE al final (archivos tocados, migraciones, cómo correr el seed, pendientes).
