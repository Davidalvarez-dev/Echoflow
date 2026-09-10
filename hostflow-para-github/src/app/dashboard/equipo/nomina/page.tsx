import { Sidebar } from "../../sidebar";
import { ComingSoon } from "../../coming-soon";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/equipo/nomina" />
      <ComingSoon
        title={{ es: "Nómina y pagos", en: "Payroll & payments" }}
        description={{ es: "Registro de pagos al equipo (efectivo o transferencia). Cada pago se vuelve gasto automáticamente.", en: "Team payment log (cash or transfer). Every payment auto-registers as an expense." }}
      />
    </div>
  );
}
