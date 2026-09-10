"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "es" | "en";

const messages = {
  es: {
    "language.name": "Español",
    "nav.dashboard": "Dashboard",
    "nav.reservations": "Reservas",
    "nav.inbox": "Bandeja",
    "nav.calendar": "Calendario",
    "nav.website": "Constructor web",
    "nav.websiteEditor": "Editor",
    "nav.websitePages": "Páginas",
    "nav.websitePreferences": "Preferencias",
    "nav.sales": "Ventas",
    "nav.opportunities": "Oportunidades",
    "nav.quotes": "Seguimiento",
    "nav.orders": "Ventas y órdenes",
    "nav.catalog": "Catálogo",
    "nav.pos": "Punto de venta",
    "nav.businessUnits": "Unidades de negocio",
    "nav.automations": "Automatizaciones",
    "nav.tools": "Herramientas",
    "nav.settings": "Configuración",
    "nav.new": "Nuevo",
    "nav.expand": "Expandir menú",
    "nav.collapse": "Contraer menú",
    "nav.reception": "Recepción",
    "nav.commercial": "Comercial",
    "nav.marketingArea": "Marketing",
    "nav.administration": "Administración",
    "nav.myHotel": "Mi hotel",
    "nav.today": "Hoy",
    "nav.unitStatus": "Estado de unidades",
    "nav.checklists": "Checklists",
    "nav.unitOrders": "Órdenes",
    "nav.team": "Equipo",
    "nav.shifts": "Turnos y horarios",
    "nav.payroll": "Nómina y pagos",
    "nav.members": "Miembros",
    "nav.expenses": "Gastos y compras",
    "nav.checklistTemplates": "Plantillas de checklists",
    "role.viewAs": "Cambiar de usuario",
    "role.management": "Gestión",
    "role.staff": "Staff",
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Rendimiento de reservas y ventas",
    "dashboard.status": "Estado de oportunidades",
    "dashboard.channelOrigin": "Origen de las reservas",
    "dashboard.channelHint": "Porcentaje por número de reservas",
    "dashboard.conversion": "Tasa de conversión",
    "dashboard.paidRevenue": "Ingresos cobrados",
    "dashboard.history": "Histórico de reservas",
    "dashboard.historyHint": "Reservas confirmadas por mes de estancia",
    "dashboard.currentYear": "Año actual",
    "dashboard.previousYear": "Año anterior",
    "dashboard.peakSeason": "Temporada más alta",
    "dashboard.reservations": "reservas",
    "dashboard.funnel": "Embudo",
    "dashboard.stageDistribution": "Distribución por etapa",
    "dashboard.propertyDistribution": "Distribución por propiedad",
    "dashboard.upcoming": "Próximas estancias",
    "dashboard.actions": "Acciones manuales",
    "dashboard.needsAttention": "reservas necesitan atención",
    "dashboard.actionsHint": "Revisa saldos pendientes y solicitudes de huéspedes sin respuesta.",
    "dashboard.openReservations": "Abrir reservas",
    "dashboard.noReservations": "No hay reservas en este periodo.",
    "dashboard.noUpcoming": "No hay próximas estancias.",
    "dashboard.totalValue": "Valor total",
    "dashboard.nextStep": "Siguiente paso",
    "dashboard.configure": "Configurar",
    "status.open": "Abiertas",
    "status.won": "Ganadas",
    "status.completed": "Completadas",
    "status.lost": "Perdidas",
    "funnel.inquiry": "Nueva consulta",
    "funnel.quote": "Cotización enviada",
    "funnel.booked": "Reservada",
    "funnel.paid": "Pagada",
    "conversion.converted": "Convertidas",
    "conversion.remaining": "Restantes",
    "date.today": "Hoy",
    "date.next7": "Próximos 7 días",
    "date.last30": "Últimos 30 días",
    "date.thisMonth": "Este mes",
    "date.thisYear": "Este año",
    "date.custom": "Rango personalizado",
    "date.select": "Seleccionar rango de fechas",
    "date.previousMonth": "Mes anterior",
    "date.nextMonth": "Mes siguiente",
    "date.preset": "Periodo",
    "date.from": "Desde",
    "date.to": "Hasta",
    "date.comparison": "Rango de comparación",
    "date.noComparison": "Sin comparación",
    "date.previousPeriod": "Periodo anterior",
    "date.previousYear": "Año anterior",
    "common.cancel": "Cancelar",
    "common.apply": "Aplicar",
    "channel.instagram": "Instagram",
    "channel.facebook": "Facebook",
    "channel.booking": "Booking.com",
    "channel.airbnb": "Airbnb",
    "channel.direct": "Web directa",
    "channel.whatsapp": "WhatsApp",
    "channel.vrbo": "Vrbo",
    "channel.google": "Google",
    "channel.referral": "Referidos",
    "channel.other": "Otros",
  },
  en: {
    "language.name": "English",
    "nav.dashboard": "Dashboard",
    "nav.reservations": "Reservations",
    "nav.inbox": "Inbox",
    "nav.calendar": "Calendar",
    "nav.website": "Website builder",
    "nav.websiteEditor": "Editor",
    "nav.websitePages": "Pages",
    "nav.websitePreferences": "Preferences",
    "nav.sales": "Sales",
    "nav.opportunities": "Opportunities",
    "nav.quotes": "Quote tracking",
    "nav.orders": "Sales and orders",
    "nav.catalog": "Catalog",
    "nav.pos": "Point of sale",
    "nav.businessUnits": "Business units",
    "nav.automations": "Automations",
    "nav.tools": "Tools",
    "nav.settings": "Settings",
    "nav.new": "New",
    "nav.expand": "Expand menu",
    "nav.collapse": "Collapse menu",
    "nav.reception": "Reception",
    "nav.commercial": "Commercial",
    "nav.marketingArea": "Marketing",
    "nav.administration": "Administration",
    "nav.myHotel": "My hotel",
    "nav.today": "Today",
    "nav.unitStatus": "Unit status",
    "nav.checklists": "Checklists",
    "nav.unitOrders": "Orders",
    "nav.team": "Team",
    "nav.shifts": "Shifts & schedules",
    "nav.payroll": "Payroll & payments",
    "nav.members": "Members",
    "nav.expenses": "Expenses & purchasing",
    "nav.checklistTemplates": "Checklist templates",
    "role.viewAs": "Switch user",
    "role.management": "Management",
    "role.staff": "Staff",
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Reservation and sales performance",
    "dashboard.status": "Opportunity status",
    "dashboard.channelOrigin": "Reservation sources",
    "dashboard.channelHint": "Percentage by reservation count",
    "dashboard.conversion": "Conversion rate",
    "dashboard.paidRevenue": "Paid revenue",
    "dashboard.history": "Reservation history",
    "dashboard.historyHint": "Confirmed reservations by stay month",
    "dashboard.currentYear": "Current year",
    "dashboard.previousYear": "Previous year",
    "dashboard.peakSeason": "Peak season",
    "dashboard.reservations": "reservations",
    "dashboard.funnel": "Funnel",
    "dashboard.stageDistribution": "Stage distribution",
    "dashboard.propertyDistribution": "Property distribution",
    "dashboard.upcoming": "Upcoming stays",
    "dashboard.actions": "Manual actions",
    "dashboard.needsAttention": "reservations need attention",
    "dashboard.actionsHint": "Review pending balances and unanswered guest requests.",
    "dashboard.openReservations": "Open reservations",
    "dashboard.noReservations": "No reservations in this period.",
    "dashboard.noUpcoming": "No upcoming stays.",
    "dashboard.totalValue": "Total value",
    "dashboard.nextStep": "Next step",
    "dashboard.configure": "Configure",
    "status.open": "Open",
    "status.won": "Won",
    "status.completed": "Completed",
    "status.lost": "Lost",
    "funnel.inquiry": "New inquiry",
    "funnel.quote": "Quote sent",
    "funnel.booked": "Booked",
    "funnel.paid": "Paid",
    "conversion.converted": "Converted",
    "conversion.remaining": "Remaining",
    "date.today": "Today",
    "date.next7": "Next 7 days",
    "date.last30": "Last 30 days",
    "date.thisMonth": "This month",
    "date.thisYear": "This year",
    "date.custom": "Custom range",
    "date.select": "Select date range",
    "date.previousMonth": "Previous month",
    "date.nextMonth": "Next month",
    "date.preset": "Period",
    "date.from": "From",
    "date.to": "To",
    "date.comparison": "Comparison date range",
    "date.noComparison": "No comparison",
    "date.previousPeriod": "Previous period",
    "date.previousYear": "Previous year",
    "common.cancel": "Cancel",
    "common.apply": "Apply",
    "channel.instagram": "Instagram",
    "channel.facebook": "Facebook",
    "channel.booking": "Booking.com",
    "channel.airbnb": "Airbnb",
    "channel.direct": "Direct website",
    "channel.whatsapp": "WhatsApp",
    "channel.vrbo": "Vrbo",
    "channel.google": "Google",
    "channel.referral": "Referrals",
    "channel.other": "Other",
  },
} as const;

export type TranslationKey = keyof typeof messages.es;

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANGUAGE_STORAGE_KEY = "hostflow.language";
const LANGUAGE_COOKIE_KEY = "hostflow.language";

function readCookieLanguage() {
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LANGUAGE_COOKIE_KEY}=`));
  const value = cookie?.split("=")[1];
  return value === "es" || value === "en" ? value : null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("es");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const initialLanguage = stored === "es" || stored === "en"
        ? stored
        : readCookieLanguage() ?? "es";
      setLanguageState(initialLanguage);
      document.documentElement.lang = initialLanguage;
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    document.documentElement.lang = nextLanguage;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${nextLanguage}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key) => messages[language][key],
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
