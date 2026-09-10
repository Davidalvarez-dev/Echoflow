import { Sidebar } from "../sidebar";
import { ComingSoon } from "../coming-soon";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/gastos" />
      <ComingSoon
        title={{ es: "Gastos y compras", en: "Expenses & purchasing" }}
        description={{ es: "Registro de gastos por categoría y unidad de negocio. Habilita utilidad real en el dashboard.", en: "Expense log by category and business unit. Enables real profit on the dashboard." }}
      />
    </div>
  );
}
