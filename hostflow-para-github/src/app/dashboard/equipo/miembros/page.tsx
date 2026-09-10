import { Sidebar } from "../../sidebar";
import { MembersRoster } from "./roster";

export default function MembersPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active="/dashboard/equipo/miembros" />
      <MembersRoster />
    </div>
  );
}
