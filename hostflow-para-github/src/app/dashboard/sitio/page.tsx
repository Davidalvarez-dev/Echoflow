import { db } from "@/lib/db";
import { Sidebar } from "../sidebar";
import { WebsiteBuilder } from "./builder";

export default async function WebsiteBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const initialTab = view === "pages"
    ? "Pages"
    : view === "preferences"
      ? "Settings"
      : "Editor";
  const rentals = await db.property.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true, nightlyRate: true },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar active={view ? `/dashboard/sitio?view=${view}` : "/dashboard/sitio"} />
      <WebsiteBuilder rentals={rentals} initialTab={initialTab} />
    </div>
  );
}
