"use client";

import { useEffect, useState } from "react";
import { type TranslationKey, useLanguage } from "../language-provider";
import { useRole } from "../role-provider";
import { EMPLOYEES, type RoleId } from "@/lib/roles";

type IconName =
  | "dashboard"
  | "reservations"
  | "inbox"
  | "calendar"
  | "website"
  | "opportunities"
  | "sales"
  | "units"
  | "automation"
  | "tools"
  | "settings"
  | "team"
  | "chevrons"
  | "caret";

type BusinessUnit = { id: string; name: string; color: string; type: string };

type NavItem = {
  labelKey: TranslationKey;
  href: string;
  icon: IconName;
  roles: RoleId[];
};

type NavSection = {
  headerKey?: TranslationKey;
  items: NavItem[];
};

// Sidebar canónico v3 (ver 🖥 hostflow — Blueprint de Áreas):
// Dashboard · MI HOTEL (módulos por unidad, generados de la DB) · VENTAS · MARKETING · EQUIPO · ADMINISTRACIÓN.
const TOP_SECTION: NavSection = {
  items: [
    { labelKey: "nav.dashboard", href: "/dashboard", icon: "dashboard", roles: ["dueno", "gerente", "ventas", "recepcion", "marketing", "encargado"] },
  ],
};

const TRANSVERSAL_SECTIONS: NavSection[] = [
  {
    headerKey: "nav.sales",
    items: [
      { labelKey: "nav.inbox", href: "/dashboard/inbox", icon: "inbox", roles: ["dueno", "gerente", "ventas"] },
      { labelKey: "nav.opportunities", href: "/dashboard/oportunidades", icon: "opportunities", roles: ["dueno", "gerente", "ventas"] },
      { labelKey: "nav.quotes", href: "/dashboard/ventas/cotizaciones", icon: "reservations", roles: ["dueno", "gerente", "ventas"] },
      { labelKey: "nav.orders", href: "/dashboard/ventas/ordenes", icon: "sales", roles: ["dueno", "gerente", "ventas"] },
      { labelKey: "nav.pos", href: "/dashboard/ventas/pos", icon: "tools", roles: ["dueno", "gerente", "ventas", "recepcion", "encargado"] },
    ],
  },
  {
    headerKey: "nav.marketingArea",
    items: [
      { labelKey: "nav.websiteEditor", href: "/dashboard/sitio?view=editor", icon: "website", roles: ["dueno", "gerente", "marketing"] },
      { labelKey: "nav.websitePages", href: "/dashboard/sitio?view=pages", icon: "website", roles: ["dueno", "gerente", "marketing"] },
      { labelKey: "nav.websitePreferences", href: "/dashboard/sitio?view=preferences", icon: "website", roles: ["dueno", "gerente", "marketing"] },
    ],
  },
  {
    headerKey: "nav.team",
    items: [
      { labelKey: "nav.shifts", href: "/dashboard/equipo/turnos", icon: "calendar", roles: ["dueno", "gerente"] },
      { labelKey: "nav.payroll", href: "/dashboard/equipo/nomina", icon: "sales", roles: ["dueno"] },
      { labelKey: "nav.members", href: "/dashboard/equipo/miembros", icon: "team", roles: ["dueno", "gerente"] },
    ],
  },
  {
    headerKey: "nav.administration",
    items: [
      { labelKey: "nav.businessUnits", href: "/dashboard/unidades", icon: "units", roles: ["dueno"] },
      { labelKey: "nav.catalog", href: "/dashboard/ventas/catalogo", icon: "units", roles: ["dueno"] },
      { labelKey: "nav.expenses", href: "/dashboard/gastos", icon: "sales", roles: ["dueno"] },
      { labelKey: "nav.checklistTemplates", href: "/dashboard/plantillas-checklists", icon: "reservations", roles: ["dueno"] },
      { labelKey: "nav.automations", href: "/dashboard/automatizaciones", icon: "automation", roles: ["dueno"] },
      { labelKey: "nav.settings", href: "/dashboard/settings", icon: "settings", roles: ["dueno"] },
    ],
  },
];

function unitModuleLinks(unit: BusinessUnit): { labelKey: TranslationKey; href: string }[] {
  if (unit.type === "LODGING") {
    return [
      { labelKey: "nav.today", href: "/dashboard/hoy" },
      { labelKey: "nav.calendar", href: "/dashboard/calendario" },
      { labelKey: "nav.reservations", href: "/dashboard/reservas" },
      { labelKey: "nav.unitStatus", href: "/dashboard/estado-unidades" },
    ];
  }
  return [
    { labelKey: "nav.today", href: `/dashboard/unidad/${unit.id}/hoy` },
    { labelKey: "nav.checklists", href: `/dashboard/unidad/${unit.id}/checklists` },
    { labelKey: "nav.unitOrders", href: `/dashboard/unidad/${unit.id}/ordenes` },
  ];
}

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    className: `h-[18px] w-[18px] ${className}`,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.9,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="18" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case "reservations":
      return (
        <svg {...common}>
          <rect x="4" y="3.5" width="16" height="17" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path d="M5 17.5 3.8 21l3.9-1.1A8.8 8.8 0 1 0 4 12.7" />
          <path d="M8 11h8M8 14h5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3.5 9h17M8 14h3M15 17h1" />
        </svg>
      );
    case "website":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21M12 3c-2.2 2.5-3.3 5.5-3.3 9S9.8 18.5 12 21" />
        </svg>
      );
    case "opportunities":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="5" height="16" rx="1.5" />
          <rect x="9.5" y="4" width="5" height="10" rx="1.5" />
          <rect x="16" y="4" width="5" height="13" rx="1.5" />
        </svg>
      );
    case "sales":
      return (
        <svg {...common}>
          <path d="M4 19V9M10 19V5M16 19v-7M3 19h18" />
          <path d="m4 7 5-4 6 5 5-4" />
        </svg>
      );
    case "units":
      return (
        <svg {...common}>
          <path d="M4 20V8l8-4 8 4v12M4 11h16M8 20v-5h3v5M15 14h2M15 17h2" />
        </svg>
      );
    case "automation":
      return (
        <svg {...common}>
          <path d="M7 4.5h7l3 3v12H7z" />
          <path d="M14 4.5v4h4M10 13h4M10 17h4" />
          <path d="M4 9.5v9A1.5 1.5 0 0 0 5.5 20H14" />
        </svg>
      );
    case "tools":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
          <path d="m19.2 13.4.1-1.4-.1-1.4 2-1.5-2-3.4-2.4 1a9 9 0 0 0-2.4-1.4L14 2.8h-4l-.4 2.5a9 9 0 0 0-2.4 1.4l-2.4-1-2 3.4 2 1.5-.1 1.4.1 1.4-2 1.5 2 3.4 2.4-1a9 9 0 0 0 2.4 1.4l.4 2.5h4l.4-2.5a9 9 0 0 0 2.4-1.4l2.4 1 2-3.4z" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19.5c.6-3.2 2.7-5 5.5-5s4.9 1.8 5.5 5" />
          <circle cx="16.5" cy="9" r="2.4" />
          <path d="M15.5 14.3c2.3.2 4 1.7 4.6 4.4" />
        </svg>
      );
    case "chevrons":
      return (
        <svg {...common}>
          <path d="m15 6-6 6 6 6M20 6l-6 6 6 6" />
        </svg>
      );
    case "caret":
      return (
        <svg {...common} className={`h-5 w-5 ${className}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
  }
}

function RoleSwitcher({ collapsed, onExpand }: { collapsed: boolean; onExpand: () => void }) {
  const { language, t } = useLanguage();
  const { role, employee, setRole } = useRole();
  const [open, setOpen] = useState(false);

  function switchTo(nextRole: RoleId) {
    setRole(nextRole);
    setOpen(false);
    const target = EMPLOYEES.find((item) => item.role === nextRole);
    if (target) window.location.assign(target.home);
  }

  const management = EMPLOYEES.filter((item) => item.clase === "A");
  const staff = EMPLOYEES.filter((item) => item.clase === "B");

  return (
    <div className="relative border-t border-ink/10 pt-4">
      {open && !collapsed && (
        <div className="absolute bottom-full left-0 right-0 z-40 mb-2 max-h-[60vh] overflow-y-auto rounded-xl border border-ink/10 bg-white shadow-[0_16px_40px_rgba(17,17,17,0.14)]">
          {[{ labelKey: "role.management" as TranslationKey, list: management }, { labelKey: "role.staff" as TranslationKey, list: staff }].map((group) => (
            <div key={group.labelKey}>
              <p className="px-4 pb-1 pt-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/35">
                {t(group.labelKey)}
              </p>
              {group.list.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => switchTo(item.role)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-ink/5 ${
                    item.role === role ? "bg-coral/20" : ""
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e7f0f6] text-[11px] font-extrabold text-ink">
                    {item.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold leading-tight text-ink">
                      {item.name[language]}
                    </span>
                    <span className="block truncate text-[11px] font-semibold leading-tight text-ink/45">
                      {item.email}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          if (collapsed) {
            onExpand();
            setOpen(true);
            return;
          }
          setOpen((value) => !value);
        }}
        className={`flex w-full items-center rounded-[10px] transition hover:bg-white ${
          collapsed ? "justify-center py-1" : "gap-2 px-1 py-1"
        }`}
        aria-expanded={open}
        aria-label={t("role.viewAs")}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e7f0f6] text-base font-semibold text-ink">
          {employee.initials}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[15px] font-bold leading-tight text-ink">
                {employee.name[language]}
              </span>
              <span className="block truncate text-[13px] font-semibold leading-tight text-ink/45">
                {employee.email}
              </span>
            </span>
            <Icon name="caret" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>
    </div>
  );
}

export function Sidebar({ active }: { active: string }) {
  const { language, setLanguage, t } = useLanguage();
  const { role, employee } = useRole();
  const [collapsed, setCollapsed] = useState(false);
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  const seesHotel = ["dueno", "gerente", "recepcion", "encargado"].includes(role);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.matchMedia("(max-width: 767px)").matches) setCollapsed(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!seesHotel) return;
    fetch("/api/business-units")
      .then((response) => response.ok ? response.json() : [])
      .then((data: BusinessUnit[]) => {
        setUnits(data);
        setOpenUnits((current) => {
          const next = { ...current };
          data.forEach((unit) => {
            if (next[unit.id] === undefined) {
              const links = unitModuleLinks(unit);
              const containsActive = links.some((link) => active.startsWith(link.href.split("?")[0]));
              next[unit.id] = containsActive || unit.type === "LODGING";
            }
          });
          return next;
        });
      })
      .catch(() => setUnits([]));
  }, [seesHotel, active]);

  // MI HOTEL: dueño/gerente ven todas las unidades; recepción/encargado solo la suya.
  const visibleUnits = units
    .filter((unit) => !employee.unitScope || unit.type === employee.unitScope)
    .sort((a, b) => (a.type === "LODGING" ? -1 : b.type === "LODGING" ? 1 : a.name.localeCompare(b.name)));

  const sections = [TOP_SECTION, ...TRANSVERSAL_SECTIONS]
    .map((section) => ({ ...section, items: section.items.filter((item) => item.roles.includes(role)) }))
    .filter((section) => section.items.length > 0);
  const topSection = sections.find((section) => !section.headerKey);
  const transversal = sections.filter((section) => section.headerKey);

  function isSelected(href: string) {
    const path = href.split("?")[0];
    if (path === "/dashboard") return active === "/dashboard";
    if (href.includes("?")) return active === href || (href.endsWith("view=editor") && active === "/dashboard/sitio");
    return active.startsWith(path);
  }

  const itemClass = (selected: boolean) =>
    `flex items-center gap-4 font-bold transition ${
      collapsed ? "h-[42px] w-[42px] justify-center rounded-[10px] px-0" : "h-9 rounded-[10px] px-3 text-[15px]"
    } ${selected ? "bg-coral text-ink" : "text-ink/85 hover:bg-white hover:text-ink"}`;

  // Clase B: sin menú — barra mínima con logo y switcher para poder recorrer la demo.
  if (employee.clase === "B") {
    return (
      <aside className={`relative z-30 flex h-screen shrink-0 flex-col border-r border-ink/10 bg-[#f7f8fa] transition-[width] duration-300 ${
        collapsed ? "w-[58px]" : "w-[240px] max-w-[84vw]"
      }`}>
        <div className={`flex h-[54px] items-center ${collapsed ? "justify-center px-2" : "px-4"}`}>
          <a href="/dashboard/mi-dia" className="font-display text-[26px] font-extrabold leading-none tracking-tight text-ink">
            {collapsed ? "H" : "Hostflow"}
          </a>
        </div>
        <div className={`flex min-h-0 flex-1 flex-col pb-4 ${collapsed ? "px-2" : "px-3"}`}>
          {!collapsed && (
            <p className="mt-2 px-2 text-[13px] font-semibold text-ink/45">
              {language === "es"
                ? "Este puesto trabaja desde MI DÍA — sin menú."
                : "This role works from MY DAY — no menu."}
            </p>
          )}
          <a
            href="/dashboard/mi-dia"
            className={`mt-3 ${itemClass(active.startsWith("/dashboard/mi-dia"))}`}
            title={collapsed ? (language === "es" ? "MI DÍA" : "MY DAY") : undefined}
          >
            <Icon name="dashboard" />
            {!collapsed && <span>{language === "es" ? "MI DÍA" : "MY DAY"}</span>}
          </a>
          <div className="mt-auto space-y-3">
            <RoleSwitcher collapsed={collapsed} onExpand={() => setCollapsed(false)} />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`relative z-30 flex h-screen shrink-0 flex-col border-r border-ink/10 bg-[#f7f8fa] transition-[width] duration-300 ${
        collapsed ? "w-[58px]" : "w-[240px] max-w-[84vw]"
      }`}
    >
      <div className={`flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-4"} h-[54px]`}>
        <a
          href={employee.home}
          className={`font-display text-[26px] font-extrabold leading-none tracking-tight text-ink ${collapsed ? "text-[24px]" : ""}`}
          aria-label="Hostflow"
        >
          {collapsed ? "H" : "Hostflow"}
        </a>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-[20px] flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_20px_rgba(17,17,17,0.12)] transition hover:bg-coral"
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
        >
          <Icon name="chevrons" className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className={`flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 ${collapsed ? "px-2" : "px-3"}`}>
        {topSection && (
          <div className={collapsed ? "space-y-2" : "space-y-0.5"}>
            {topSection.items.map((item) => (
              <a key={item.href} href={item.href} className={itemClass(isSelected(item.href))} title={collapsed ? t(item.labelKey) : undefined}>
                <Icon name={item.icon} />
                {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
              </a>
            ))}
          </div>
        )}

        {seesHotel && visibleUnits.length > 0 && (
          <div>
            {collapsed
              ? <div className="my-3 border-t border-ink/10" />
              : <p className="mb-1 mt-5 px-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/35">{t("nav.myHotel")}</p>}
            <div className={collapsed ? "space-y-2" : "space-y-0.5"}>
              {visibleUnits.map((unit) => {
                const links = unitModuleLinks(unit);
                const open = openUnits[unit.id] ?? false;
                if (collapsed) {
                  return (
                    <a key={unit.id} href={links[0].href} className={itemClass(links.some((link) => isSelected(link.href)))} title={unit.name}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: unit.color }} />
                    </a>
                  );
                }
                return (
                  <div key={unit.id}>
                    <button
                      type="button"
                      onClick={() => setOpenUnits((current) => ({ ...current, [unit.id]: !open }))}
                      className="flex h-9 w-full items-center gap-3 rounded-[10px] px-3 text-[15px] font-bold text-ink/85 transition hover:bg-white"
                      aria-expanded={open}
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: unit.color }} />
                      <span className="flex-1 truncate text-left">{unit.name}</span>
                      <Icon name="caret" className={`transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <div className="mt-0.5 space-y-0.5">
                        {links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            className={`ml-6 flex h-8 items-center gap-3 rounded-[8px] px-3 text-[13px] font-bold transition ${
                              isSelected(link.href) ? "bg-coral text-ink" : "text-ink/65 hover:bg-white hover:text-ink"
                            }`}
                          >
                            <span>{t(link.labelKey)}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {transversal.map((section) => (
          <div key={section.headerKey}>
            {collapsed
              ? <div className="my-3 border-t border-ink/10" />
              : <p className="mb-1 mt-5 px-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/35">{t(section.headerKey!)}</p>}
            <div className={collapsed ? "space-y-2" : "space-y-0.5"}>
              {section.items.map((item) => (
                <a key={item.href} href={item.href} className={itemClass(isSelected(item.href))} title={collapsed ? t(item.labelKey) : undefined}>
                  <Icon name={item.icon} />
                  {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                </a>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-auto space-y-3 pt-5">
          <label
            className={`flex items-center gap-3 text-sm font-bold text-ink/70 ${collapsed ? "justify-center" : "px-2"}`}
            title={collapsed ? t("language.name") : undefined}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-ink/10 bg-white text-[11px] font-extrabold uppercase">
              {language}
            </span>
            {!collapsed && (
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as "es" | "en")}
                className="h-9 min-w-0 flex-1 rounded-md border border-ink/10 bg-white px-2 text-xs font-bold outline-none focus:border-ink"
                aria-label="Idioma de la aplicación"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            )}
          </label>

          <RoleSwitcher collapsed={collapsed} onExpand={() => setCollapsed(false)} />
        </div>
      </nav>
    </aside>
  );
}
