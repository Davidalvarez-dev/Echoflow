"use client";

import { useLanguage } from "../../../language-provider";
import { useRole } from "../../../role-provider";
import { EMPLOYEES } from "@/lib/roles";

export function MembersRoster() {
  const { language } = useLanguage();
  const { role, setRole } = useRole();
  const es = language === "es";

  const groups = [
    { title: es ? "Gestión (ven menú)" : "Management (see menu)", list: EMPLOYEES.filter((e) => e.clase === "A") },
    { title: es ? "Staff (viven en MI DÍA)" : "Staff (live in MY DAY)", list: EMPLOYEES.filter((e) => e.clase === "B") },
  ];

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[#f6f7f9] p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-2xl font-extrabold text-ink">{es ? "Miembros del equipo" : "Team members"}</h1>
        <p className="mt-1 text-sm text-ink/50">
          {es
            ? "Plantillas de puesto preexistentes — al dar de alta a alguien real, eliges su plantilla y ajustas permisos con switches."
            : "Preset role templates — when adding a real member, pick their template and adjust permissions with switches."}
        </p>

        {groups.map((group) => (
          <section key={group.title} className="mt-7">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/35">{group.title}</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.list.map((employee) => (
                <button
                  key={employee.role}
                  type="button"
                  onClick={() => {
                    setRole(employee.role);
                    window.location.assign(employee.home);
                  }}
                  className={`rounded-2xl border bg-white p-4 text-left transition hover:border-ink/40 ${
                    employee.role === role ? "border-ink" : "border-ink/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e7f0f6] text-sm font-extrabold text-ink">
                      {employee.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink">{employee.name[language]}</span>
                      <span className="block truncate text-xs text-ink/45">{employee.email}</span>
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-ink/50">
                    {employee.role === role
                      ? (es ? "Sesión actual" : "Current session")
                      : (es ? "Ver la plataforma como este puesto →" : "View the platform as this role →")}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
