import { Sidebar } from "../sidebar";
import { ComingSoon } from "../coming-soon";

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/plantillas-checklists" />
      <ComingSoon
        title={{ es: "Plantillas de checklists", en: "Checklist templates" }}
        description={{ es: "Tus SOPs hechos software: apertura, cierre, preparación de unidad. Se ejecutan en MI DÍA.", en: "Your SOPs as software: opening, closing, unit prep. Executed in MY DAY." }}
      />
    </div>
  );
}
