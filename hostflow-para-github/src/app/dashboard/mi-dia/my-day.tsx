"use client";

import { useState } from "react";
import { useLanguage } from "../../language-provider";
import { useRole } from "../../role-provider";
import type { RoleId } from "@/lib/roles";

export type MyDayData = {
  departures: { id: string; propertyName: string; guestCount: number }[];
  arrivals: { id: string; propertyName: string; guestCount: number }[];
  arrivalsTomorrow: number;
  guestsToday: number;
};

type Task = { id: string; label: string; detail?: string };

// Checklists demo por puesto — se volverán plantillas reales de Administración.
function tasksFor(role: RoleId, data: MyDayData, es: boolean): { title: string; tasks: Task[] }[] {
  switch (role) {
    case "camarista":
      return [
        {
          title: es ? "Unidades a preparar (salidas de hoy)" : "Units to prepare (today's checkouts)",
          tasks: data.departures.map((d) => ({
            id: d.id,
            label: es ? `Preparar ${d.propertyName}` : `Prepare ${d.propertyName}`,
            detail: es ? "Checklist: blancos · amenities · piso · terraza" : "Checklist: linens · amenities · floors · deck",
          })),
        },
        {
          title: es ? "Rutina diaria" : "Daily routine",
          tasks: [
            { id: "r1", label: es ? "Reponer amenities en unidades ocupadas" : "Restock amenities in occupied units" },
            { id: "r2", label: es ? "Revisar áreas comunes" : "Check common areas" },
          ],
        },
      ];
    case "mantenimiento":
      return [
        {
          title: es ? "Incidencias abiertas" : "Open issues",
          tasks: [
            { id: "m1", label: es ? "Sin incidencias reportadas hoy 🎉" : "No issues reported today 🎉" },
          ],
        },
        {
          title: es ? "Rutina diaria" : "Daily routine",
          tasks: [
            { id: "m2", label: es ? "Química y limpieza de alberca" : "Pool chemistry & cleaning" },
            { id: "m3", label: es ? "Revisar gas y leña de unidades" : "Check gas & firewood per unit" },
            { id: "m4", label: es ? "Ronda de áreas verdes" : "Grounds walkthrough" },
          ],
        },
      ];
    case "mesero":
      return [
        {
          title: es ? "Apertura de restaurante" : "Restaurant opening",
          tasks: [
            { id: "s1", label: es ? "Montar mesas y estaciones" : "Set tables & stations" },
            { id: "s2", label: es ? "Revisar reservas de cena de hoy" : "Review tonight's dinner bookings" },
          ],
        },
        {
          title: es ? "Cierre" : "Closing",
          tasks: [
            { id: "s3", label: es ? "Corte de caja del turno" : "Shift cash count" },
            { id: "s4", label: es ? "Checklist de cierre (gas, luces, básicos)" : "Closing checklist (gas, lights, basics)" },
          ],
        },
      ];
    case "cocina":
      return [
        {
          title: es ? "Producción de hoy" : "Today's production",
          tasks: [
            {
              id: "c1",
              label: es
                ? `Desayunos: ~${data.guestsToday} huéspedes en casa`
                : `Breakfasts: ~${data.guestsToday} guests in house`,
            },
            {
              id: "c2",
              label: es
                ? `Mañana llegan ${data.arrivalsTomorrow} reservas — planear compras`
                : `${data.arrivalsTomorrow} reservations arrive tomorrow — plan purchases`,
            },
          ],
        },
        {
          title: es ? "Servicios vendidos" : "Sold services",
          tasks: [
            { id: "c3", label: es ? "Cena romántica · Domo Luna · 8pm (demo)" : "Romantic dinner · Domo Luna · 8pm (demo)" },
          ],
        },
      ];
    case "masajista":
      return [
        {
          title: es ? "Servicios de hoy" : "Today's services",
          tasks: [
            { id: "t1", label: es ? "Masaje en pareja · 5:00pm (demo)" : "Couples massage · 5:00pm (demo)", detail: es ? "Checklist cabina: sábanas · aceites · música · temperatura" : "Cabin checklist: sheets · oils · music · temperature" },
          ],
        },
      ];
    case "guia":
      return [
        {
          title: es ? "Experiencias de hoy" : "Today's experiences",
          tasks: [
            { id: "g1", label: es ? "Sin experiencias programadas (módulo futuro)" : "No experiences scheduled (future module)" },
          ],
        },
      ];
    case "encargado":
      return [
        {
          title: es ? "Supervisión del restaurante" : "Restaurant supervision",
          tasks: [
            { id: "e1", label: es ? "Verificar apertura completada" : "Verify opening completed" },
            { id: "e2", label: es ? "Revisar órdenes y corte del día" : "Review orders & daily cash count" },
          ],
        },
      ];
    default:
      return [];
  }
}

const CAN_USE_POS: RoleId[] = ["mesero", "masajista", "encargado"];

export function MyDay({ data }: { data: MyDayData }) {
  const { language } = useLanguage();
  const { role, employee } = useRole();
  const es = language === "es";
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [reported, setReported] = useState(false);

  const groups = tasksFor(role, data, es);
  const totalTasks = groups.reduce((sum, group) => sum + group.tasks.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;
  const todayLabel = new Date().toLocaleDateString(es ? "es-MX" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f6f7f9]">
      <header className="shrink-0 border-b border-ink/10 bg-white px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink">{es ? "MI DÍA" : "MY DAY"}</h1>
            <p className="mt-0.5 text-sm text-ink/45">
              <span className="capitalize">{todayLabel}</span> · {employee.name[language]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-bold text-ink/60">
              {es ? "Turno de hoy: 8:00–16:00 (demo)" : "Today's shift: 8:00–16:00 (demo)"}
            </span>
            <span className="rounded-full bg-coral/25 px-3 py-1.5 text-xs font-extrabold text-ink">
              {doneCount}/{totalTasks} ✓
            </span>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
        {groups.map((group) => (
          <section key={group.title} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <h2 className="border-b border-ink/10 px-5 py-3.5 text-sm font-bold text-ink">{group.title}</h2>
            <div className="divide-y divide-ink/5">
              {group.tasks.map((task) => {
                const checked = done[task.id] ?? false;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setDone((current) => ({ ...current, [task.id]: !checked }))}
                    className="flex w-full items-start gap-3.5 px-5 py-3.5 text-left transition hover:bg-ink/[0.03]"
                  >
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-extrabold transition ${
                        checked ? "border-[#0f7657] bg-[#0f7657] text-white" : "border-ink/25 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-bold ${checked ? "text-ink/35 line-through" : "text-ink"}`}>
                        {task.label}
                      </span>
                      {task.detail && <span className="mt-0.5 block text-xs text-ink/45">{task.detail}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap gap-3 pb-4">
          <button
            type="button"
            onClick={() => setReported(true)}
            className="rounded-full border border-ink/20 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-ink"
          >
            {reported
              ? (es ? "Incidencia reportada ✓ (demo)" : "Issue reported ✓ (demo)")
              : (es ? "⚠️ Reportar incidencia" : "⚠️ Report an issue")}
          </button>
          {CAN_USE_POS.includes(role) && (
            <a
              href="/dashboard/ventas/pos"
              className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-cream transition hover:bg-black"
            >
              {es ? "💳 Abrir punto de venta" : "💳 Open point of sale"}
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
