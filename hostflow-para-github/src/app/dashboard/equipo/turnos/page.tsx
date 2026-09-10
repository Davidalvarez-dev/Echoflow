import { Sidebar } from "../../sidebar";
import { ComingSoon } from "../../coming-soon";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/equipo/turnos" />
      <ComingSoon
        title={{ es: "Turnos y horarios", en: "Shifts & schedules" }}
        description={{ es: "Grilla semanal de turnos por persona. El staff verá su turno en MI DÍA.", en: "Weekly shift grid per person. Staff sees their shift in MY DAY." }}
      />
    </div>
  );
}
