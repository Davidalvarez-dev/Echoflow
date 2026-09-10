export type RoleId =
  | "dueno"
  | "gerente"
  | "ventas"
  | "recepcion"
  | "marketing"
  | "encargado"
  | "camarista"
  | "mantenimiento"
  | "mesero"
  | "cocina"
  | "masajista"
  | "guia";

// Clase A = usuarios de menú (gestionan procesos, ven sidebar).
// Clase B = usuarios de una pantalla (staff operativo, viven en MI DÍA).
export type RoleClass = "A" | "B";

export type DashboardKind = "executive" | "management" | "sales" | "frontDesk" | "marketing" | "operations";

export type Employee = {
  role: RoleId;
  clase: RoleClass;
  name: Record<"es" | "en", string>;
  email: string;
  initials: string;
  home: string;
  dashboard: DashboardKind;
  // Limita los módulos de MI HOTEL visibles a un tipo de unidad (Encargado, Recepción).
  unitScope?: "LODGING" | "RESTAURANT" | "SPA";
};

// Plantillas de puestos preexistentes (ver 🖥 hostflow — Blueprint de Áreas).
export const EMPLOYEES: Employee[] = [
  {
    role: "dueno",
    clase: "A",
    name: { es: "Dueño de negocio", en: "Business owner" },
    email: "dueno@hostflow.demo",
    initials: "DN",
    home: "/dashboard",
    dashboard: "executive",
  },
  {
    role: "gerente",
    clase: "A",
    name: { es: "Gerente general", en: "General manager" },
    email: "gerente@hostflow.demo",
    initials: "GG",
    home: "/dashboard",
    dashboard: "management",
  },
  {
    role: "ventas",
    clase: "A",
    name: { es: "Agente de ventas", en: "Sales agent" },
    email: "ventas@hostflow.demo",
    initials: "AV",
    home: "/dashboard",
    dashboard: "sales",
  },
  {
    role: "recepcion",
    clase: "A",
    name: { es: "Recepcionista", en: "Front desk" },
    email: "recepcion@hostflow.demo",
    initials: "RC",
    home: "/dashboard",
    dashboard: "frontDesk",
    unitScope: "LODGING",
  },
  {
    role: "marketing",
    clase: "A",
    name: { es: "Marketing", en: "Marketing" },
    email: "marketing@hostflow.demo",
    initials: "MK",
    home: "/dashboard",
    dashboard: "marketing",
  },
  {
    role: "encargado",
    clase: "A",
    name: { es: "Encargado de restaurante", en: "Restaurant lead" },
    email: "encargado@hostflow.demo",
    initials: "ER",
    home: "/dashboard",
    dashboard: "operations",
    unitScope: "RESTAURANT",
  },
  {
    role: "camarista",
    clase: "B",
    name: { es: "Camarista (limpieza)", en: "Housekeeper" },
    email: "limpieza@hostflow.demo",
    initials: "CA",
    home: "/dashboard/mi-dia",
    dashboard: "operations",
  },
  {
    role: "mantenimiento",
    clase: "B",
    name: { es: "Mantenimiento", en: "Maintenance" },
    email: "mantenimiento@hostflow.demo",
    initials: "MT",
    home: "/dashboard/mi-dia",
    dashboard: "operations",
  },
  {
    role: "mesero",
    clase: "B",
    name: { es: "Mesero/a", en: "Server" },
    email: "mesero@hostflow.demo",
    initials: "ME",
    home: "/dashboard/mi-dia",
    dashboard: "operations",
    unitScope: "RESTAURANT",
  },
  {
    role: "cocina",
    clase: "B",
    name: { es: "Cocinero/a", en: "Cook" },
    email: "cocina@hostflow.demo",
    initials: "CO",
    home: "/dashboard/mi-dia",
    dashboard: "operations",
    unitScope: "RESTAURANT",
  },
  {
    role: "masajista",
    clase: "B",
    name: { es: "Masajista / Terapeuta", en: "Spa therapist" },
    email: "spa@hostflow.demo",
    initials: "MA",
    home: "/dashboard/mi-dia",
    dashboard: "operations",
    unitScope: "SPA",
  },
  {
    role: "guia",
    clase: "B",
    name: { es: "Guía de experiencias", en: "Experience guide" },
    email: "guia@hostflow.demo",
    initials: "GU",
    home: "/dashboard/mi-dia",
    dashboard: "operations",
  },
];

export const DEFAULT_ROLE: RoleId = "dueno";

export function employeeOf(role: RoleId): Employee {
  return EMPLOYEES.find((employee) => employee.role === role) ?? EMPLOYEES[0];
}
