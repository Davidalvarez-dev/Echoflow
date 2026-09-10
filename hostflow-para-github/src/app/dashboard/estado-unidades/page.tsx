import { Sidebar } from "../sidebar";
import { ComingSoon } from "../coming-soon";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/estado-unidades" />
      <ComingSoon
        title={{ es: "Estado de unidades", en: "Unit status" }}
        description={{ es: "Tablero: Ocupada → Sucia → En limpieza → Lista. Conecta recepción con limpieza en tiempo real.", en: "Board: Occupied → Dirty → Cleaning → Ready. Connects front desk and housekeeping in real time." }}
      />
    </div>
  );
}
