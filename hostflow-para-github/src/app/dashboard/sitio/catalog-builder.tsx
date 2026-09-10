"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { WebsiteRental } from "./management-panels";
import { defaultThemeSettings, ThemeSettingsPanel, type ThemeSettings } from "./theme-settings-panel";

type EditorNode =
  | "announcement"
  | "header"
  | "logo"
  | "menu"
  | "hero"
  | "heading"
  | "button"
  | "search"
  | "catalog"
  | "map"
  | "promo"
  | "footer"
  | "utilities";
type PreviewMode = "desktop" | "mobile";
type CatalogLayout = "grid" | "list";
type PickerKind = "section" | "block";
type EditorMode = "sections" | "theme" | "apps";
type LibraryItem = {
  name: string;
  category: string;
  icon: "sections" | "image" | "text" | "map" | "folder";
};

const nodeLabels: Record<EditorNode, string> = {
  announcement: "Barra de anuncios",
  header: "Encabezado",
  logo: "Logo",
  menu: "Menú",
  hero: "Portada",
  heading: "Encabezado de portada",
  button: "Botón principal",
  search: "Buscador de reservas",
  catalog: "Alojamientos destacados",
  map: "Mapa",
  promo: "Mensaje destacado",
  footer: "Pie de página",
  utilities: "Utilidades",
};

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: "back" | "desktop" | "mobile" | "grip" | "plus" | "search" | "map" | "home" | "cart" | "sections" | "settings" | "apps" | "undo" | "redo" | "more" | "chevron" | "eye" | "trash" | "sparkles" | "text" | "image" | "folder";
  className?: string;
}) {
  const common = { className, fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { strokeWidth: "var(--hf-icon-stroke, 1.8)" } as CSSProperties, viewBox: "0 0 24 24", "aria-hidden": true };
  if (name === "back") return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
  if (name === "desktop") return <svg {...common}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;
  if (name === "mobile") return <svg {...common}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>;
  if (name === "grip") return <svg {...common}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "map") return <svg {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" /></svg>;
  if (name === "home") return <svg {...common}><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>;
  if (name === "cart") return <svg {...common}><path d="M4 7h16l-1.5 12h-13Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></svg>;
  if (name === "sections") return <svg {...common}><rect x="4" y="3" width="16" height="5" rx="1" /><rect x="4" y="10" width="16" height="5" rx="1" /><rect x="4" y="17" width="16" height="4" rx="1" /></svg>;
  if (name === "settings") return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></svg>;
  if (name === "apps") return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17.5 14v7M14 17.5h7" /></svg>;
  if (name === "undo") return <svg {...common}><path d="M9 7 4 12l5 5" /><path d="M20 17a7 7 0 0 0-7-7H4" /></svg>;
  if (name === "redo") return <svg {...common}><path d="m15 7 5 5-5 5" /><path d="M4 17a7 7 0 0 1 7-7h9" /></svg>;
  if (name === "more") return <svg {...common}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
  if (name === "chevron") return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
  if (name === "eye") return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
  if (name === "trash") return <svg {...common}><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7" /></svg>;
  if (name === "sparkles") return <svg {...common}><path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3ZM18 13l.8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13ZM6 13l.8 2.2L9 16l-2.2.8L6 19l-.8-2.2L3 16l2.2-.8L6 13Z" /></svg>;
  if (name === "text") return <svg {...common}><path d="M4 6h16M4 12h11M4 18h14" /></svg>;
  if (name === "image") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m5 18 5-5 3 3 2-2 4 4" /></svg>;
  if (name === "folder") return <svg {...common}><path d="M3 6h7l2 2h9v11H3Z" /></svg>;
  return null;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-ink/10 py-3 last:border-b-0">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="relative shrink-0">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <span className="block h-6 w-11 rounded-full bg-ink/15 transition peer-checked:bg-ink" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  const classes = "mt-2 w-full rounded-md border border-ink/15 bg-white px-3 text-sm outline-none focus:border-ink";
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      {multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={`${classes} resize-none py-3 leading-relaxed`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={`${classes} h-10`} />}
    </label>
  );
}

function TreeRow({ node, selected, nested = 0, subtitle, onSelect, expandable = false, expanded = false, onToggle, visible = true, onVisibility, removable = false, onRemove }: { node: EditorNode; selected: boolean; nested?: number; subtitle?: string; onSelect: (node: EditorNode) => void; expandable?: boolean; expanded?: boolean; onToggle?: () => void; visible?: boolean; onVisibility?: () => void; removable?: boolean; onRemove?: () => void }) {
  return (
    <div className={`group flex min-h-10 w-full items-center rounded-md transition ${selected ? "bg-coral text-ink" : "hover:bg-ink/[0.04]"}`} style={{ paddingLeft: 8 + nested * 22 }}>
      <button type="button" onClick={() => { if (expandable && onToggle) onToggle(); onSelect(node); }} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left">
        {nested === 0 ? <span className={`transition ${expandable && expanded ? "rotate-90" : ""}`}><Icon name="chevron" className="h-3.5 w-3.5 text-ink/45" /></span> : <span className="w-3.5" />}
        <Icon name={nested ? (node === "menu" ? "folder" : "grip") : "sections"} className="h-4 w-4 shrink-0 text-ink/55" />
        <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${visible ? "" : "opacity-40"}`}>{nodeLabels[node]}{subtitle && <span className="font-normal italic text-ink/50"> · {subtitle}</span>}</span>
      </button>
      <div className="mr-2 flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        {removable && <button type="button" onClick={onRemove} className="grid h-7 w-7 place-items-center rounded hover:bg-white/70" aria-label={`Eliminar ${nodeLabels[node]}`}><Icon name="trash" /></button>}
        {onVisibility && <button type="button" onClick={onVisibility} className="grid h-7 w-7 place-items-center rounded hover:bg-white/70" aria-label={`${visible ? "Ocultar" : "Mostrar"} ${nodeLabels[node]}`}><Icon name="eye" /></button>}
      </div>
    </div>
  );
}

function AddRow({ label, onClick }: { label: string; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-2 rounded-md px-8 py-2 text-left text-sm font-semibold text-ink/65 hover:bg-ink/[0.04] hover:text-ink"><span className="grid h-5 w-5 place-items-center rounded-full border border-ink/30"><Icon name="plus" className="h-3 w-3" /></span>{label}</button>;
}

const sectionLibrary: LibraryItem[] = [
  { name: "Portada inmersiva", category: "Portadas", icon: "sections" as const },
  { name: "Portada dividida", category: "Portadas", icon: "sections" as const },
  { name: "Galería de alojamientos", category: "Catálogo", icon: "image" as const },
  { name: "Beneficios de reserva directa", category: "Conversión", icon: "text" as const },
  { name: "Testimonios", category: "Confianza", icon: "text" as const },
  { name: "Preguntas frecuentes", category: "Contenido", icon: "sections" as const },
  { name: "Mapa y ubicación", category: "Ubicación", icon: "map" as const },
  { name: "Mensaje destacado", category: "Conversión", icon: "sections" as const },
];

const blockLibrary: LibraryItem[] = [
  { name: "Botón", category: "Básico", icon: "sections" as const },
  { name: "Encabezado", category: "Básico", icon: "text" as const },
  { name: "Logo", category: "Básico", icon: "image" as const },
  { name: "Texto", category: "Básico", icon: "text" as const },
  { name: "Marquesina", category: "Decorativo", icon: "sections" as const },
  { name: "Texto grande", category: "Decorativo", icon: "text" as const },
  { name: "Espaciador", category: "Diseño", icon: "sections" as const },
  { name: "Grupo", category: "Diseño", icon: "folder" as const },
];

function LibraryPicker({ kind, onClose, onAdd }: { kind: PickerKind; onClose: () => void; onAdd: (name: string) => void }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"items" | "apps">("items");
  const items = kind === "section" ? sectionLibrary : blockLibrary;
  const filtered = items.filter((item) => item.name.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  const [selectedItem, setSelectedItem] = useState(items[0].name);
  const grouped = filtered.reduce<Record<string, LibraryItem[]>>((groups, item) => {
    groups[item.category] = [...(groups[item.category] ?? []), item];
    return groups;
  }, {});

  return (
    <div className="absolute inset-x-4 bottom-4 top-[68px] z-40 ml-[310px] flex overflow-hidden rounded-xl border border-ink/15 bg-[#e8e9ea] shadow-[0_24px_70px_rgba(17,17,17,0.24)]">
      <aside className="flex w-[390px] shrink-0 flex-col border-r border-ink/10 bg-white">
        <div className="border-b border-ink/10 p-3">
          <div className="flex items-center gap-2 rounded-md border-2 border-ink bg-white px-3 focus-within:border-coral">
            <Icon name="search" className="h-5 w-5 text-ink/45" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={kind === "section" ? "Buscar secciones" : "Buscar bloques"} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" />
            <button type="button" onClick={onClose} className="text-lg text-ink/45" aria-label="Cerrar biblioteca">×</button>
          </div>
          <div className="mt-2 grid grid-cols-2 rounded-md bg-ink/[0.06] p-1">
            <button type="button" onClick={() => setTab("items")} className={`rounded px-3 py-2 text-sm font-semibold ${tab === "items" ? "bg-white shadow-sm" : "text-ink/55"}`}>{kind === "section" ? "Secciones" : "Bloques"}</button>
            <button type="button" onClick={() => setTab("apps")} className={`rounded px-3 py-2 text-sm font-semibold ${tab === "apps" ? "bg-white shadow-sm" : "text-ink/55"}`}>Apps</button>
          </div>
          <button type="button" className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-bold hover:bg-ink/[0.04]"><Icon name="sparkles" className="h-5 w-5 text-[#7955ef]" />Generar con IA</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {tab === "apps" ? (
            <div className="py-10 text-center"><Icon name="apps" className="mx-auto h-8 w-8 text-ink/25" /><p className="mt-3 text-sm font-bold">Bloques de aplicaciones</p><p className="mt-1 text-xs text-ink/45">Conecta reseñas, chat y herramientas externas.</p></div>
          ) : Object.keys(grouped).length ? Object.entries(grouped).map(([category, categoryItems]) => (
            <section key={category} className="border-b border-ink/10 py-3 last:border-b-0">
              <h3 className="mb-2 px-2 text-sm font-extrabold">{category}</h3>
              {categoryItems.map((item) => <button key={item.name} type="button" onClick={() => setSelectedItem(item.name)} className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm ${selectedItem === item.name ? "bg-coral font-bold" : "hover:bg-ink/[0.04]"}`}><Icon name={item.icon} className="h-5 w-5" />{item.name}</button>)}
            </section>
          )) : <p className="px-3 py-10 text-center text-sm text-ink/45">No encontramos resultados.</p>}
        </div>
      </aside>
      <div className="relative flex min-w-0 flex-1 items-center justify-center p-10">
        <div className="absolute right-5 top-5 flex gap-2"><button type="button" onClick={onClose} className="rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold">Cancelar</button><button type="button" onClick={() => onAdd(selectedItem)} className="rounded-md bg-ink px-5 py-2 text-sm font-bold text-white">Agregar</button></div>
        <div className="w-full max-w-2xl overflow-hidden rounded-md border border-ink/10 bg-white shadow-lg">
          {kind === "section" ? <div className="grid min-h-64 grid-cols-2"><div className="grid content-end bg-gradient-to-br from-[#26382d] via-[#65765d] to-[#c5bb87] p-7 text-white"><p className="text-xs font-bold uppercase">{selectedItem}</p><h3 className="mt-2 font-display text-3xl font-extrabold">Una estancia que recordarás</h3><button type="button" className="mt-5 w-fit rounded bg-coral px-4 py-2 text-xs font-bold text-ink">Reservar</button></div><div className="bg-[linear-gradient(135deg,#dbc99c,#9bb09a)]" /></div> : <div className="grid min-h-64 place-items-center bg-[#f7f7f5] p-10">{selectedItem === "Botón" ? <button type="button" className="rounded-md bg-ink px-8 py-4 font-bold text-white">Reservar ahora</button> : selectedItem === "Logo" ? <p className="font-display text-4xl font-extrabold">Echological</p> : <p className={`${selectedItem === "Texto grande" || selectedItem === "Encabezado" ? "font-display text-5xl font-extrabold" : "max-w-md text-center text-xl"}`}>{selectedItem === "Texto" ? "Comparte los detalles que hacen única tu propiedad." : selectedItem}</p>}</div>}
        </div>
      </div>
    </div>
  );
}

function RentalArtwork({ index, name }: { index: number; name: string }) {
  const palettes = ["from-[#273c2e] via-[#5e7758] to-[#c1b782]", "from-[#533d2f] via-[#8b7558] to-[#d8c89d]", "from-[#243c45] via-[#507477] to-[#b7c8b8]", "from-[#3c342a] via-[#75654d] to-[#c8b37a]"];
  return <div className={`rental-artwork relative min-h-32 overflow-hidden bg-gradient-to-br transition-transform duration-300 ${palettes[index % palettes.length]}`} aria-label={`Imagen de ${name}`}><span className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-b-[82px] border-l-[68px] border-r-[68px] border-b-cream/95 border-l-transparent border-r-transparent" /><span className="absolute bottom-0 left-1/2 h-12 w-16 -translate-x-1/2 rounded-t-full bg-ink/35" /></div>;
}

function SelectionFrame({ active, label, children, onClick }: { active: boolean; label: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <div onClick={(event) => { event.stopPropagation(); onClick(); }} className={`relative cursor-pointer border-2 ${active ? "border-coral" : "border-transparent hover:border-ink/15"}`}>
      {active && <span className="absolute left-2 top-0 z-20 -translate-y-1/2 rounded bg-coral px-2 py-1 text-[10px] font-bold uppercase text-ink">{label}</span>}
      {children}
    </div>
  );
}

function Inspector({
  selected,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  announcement,
  setAnnouncement,
  layout,
  setLayout,
  showMap,
  setShowMap,
  showPrices,
  setShowPrices,
  showAmenities,
  setShowAmenities,
  markDirty,
  close,
}: {
  selected: EditorNode;
  title: string;
  setTitle: (value: string) => void;
  subtitle: string;
  setSubtitle: (value: string) => void;
  announcement: string;
  setAnnouncement: (value: string) => void;
  layout: CatalogLayout;
  setLayout: (value: CatalogLayout) => void;
  showMap: boolean;
  setShowMap: (value: boolean) => void;
  showPrices: boolean;
  setShowPrices: (value: boolean) => void;
  showAmenities: boolean;
  setShowAmenities: (value: boolean) => void;
  markDirty: () => void;
  close: () => void;
}) {
  const update = (setter: (value: string) => void) => (value: string) => { setter(value); markDirty(); };
  return (
    <section className="border-t border-ink/10 bg-white">
      <div className="flex h-12 items-center gap-2 border-b border-ink/10 px-4">
        <Icon name="sections" className="h-4 w-4" />
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold">{nodeLabels[selected]}</h2>
        <button type="button" className="text-ink/55" aria-label="Más opciones"><Icon name="more" /></button>
        <button type="button" onClick={close} className="text-lg text-ink/55" aria-label="Cerrar configuración">×</button>
      </div>
      <div className="space-y-5 px-4 py-5">
        {selected === "announcement" && <><Field label="Mensaje" value={announcement} onChange={update(setAnnouncement)} /><Toggle checked onChange={() => markDirty()} label="Mostrar en todas las páginas" /></>}
        {(selected === "header" || selected === "menu") && <>
          <label className="block text-sm font-bold">Menú<select className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option>Menú principal</option><option>Menú compacto</option></select></label>
          <div><p className="text-xs font-bold uppercase text-ink/45">Apariencia</p><Toggle checked onChange={() => markDirty()} label="Fondo claro" /><Toggle checked={false} onChange={() => markDirty()} label="Encabezado fijo" /></div>
          <label className="block text-sm font-bold">Tamaño de navegación<select className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option>Mediano</option><option>Compacto</option><option>Grande</option></select></label>
        </>}
        {selected === "logo" && <><Field label="Nombre del sitio" value="Echological" onChange={() => markDirty()} /><label className="block text-sm font-bold">Tamaño<select className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option>Mediano</option><option>Pequeño</option><option>Grande</option></select></label><Toggle checked={false} onChange={() => markDirty()} label="Usar imagen de logo" /></>}
        {(selected === "hero" || selected === "heading") && <><Field label="Título" value={title} onChange={update(setTitle)} /><Field label="Descripción" value={subtitle} onChange={update(setSubtitle)} multiline /><label className="block text-sm font-bold">Altura<select className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option>Media</option><option>Compacta</option><option>Amplia</option></select></label></>}
        {selected === "button" && <><Field label="Etiqueta" value="Reservar ahora" onChange={() => markDirty()} /><label className="block text-sm font-bold">Destino<select className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option>Motor de reservas</option><option>Catálogo</option><option>Contacto</option></select></label></>}
        {selected === "search" && <><label className="block text-sm font-bold">Presentación<select className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm"><option>Barra completa</option><option>Compacta</option></select></label><Toggle checked onChange={() => markDirty()} label="Solicitar fechas" /><Toggle checked onChange={() => markDirty()} label="Solicitar huéspedes" /></>}
        {selected === "catalog" && <><div><p className="text-sm font-bold">Presentación</p><div className="mt-2 grid grid-cols-2 gap-1 rounded-md bg-ink/[0.05] p-1"><button type="button" onClick={() => { setLayout("grid"); markDirty(); }} className={`rounded px-2 py-2 text-xs font-bold ${layout === "grid" ? "bg-white shadow-sm" : "text-ink/50"}`}>Cuadrícula</button><button type="button" onClick={() => { setLayout("list"); markDirty(); }} className={`rounded px-2 py-2 text-xs font-bold ${layout === "list" ? "bg-white shadow-sm" : "text-ink/50"}`}>Lista</button></div></div><Toggle checked={showPrices} onChange={(value) => { setShowPrices(value); markDirty(); }} label="Mostrar precio" /><Toggle checked={showAmenities} onChange={(value) => { setShowAmenities(value); markDirty(); }} label="Mostrar servicios" /></>}
        {selected === "map" && <><Toggle checked={showMap} onChange={(value) => { setShowMap(value); markDirty(); }} label="Mostrar mapa" /><Toggle checked onChange={() => markDirty()} label="Actualizar al mover mapa" /></>}
        {selected === "promo" && <><Field label="Mensaje" value="Reserva directa, atención cercana" onChange={() => markDirty()} /><Toggle checked onChange={() => markDirty()} label="Mostrar icono" /></>}
        {selected === "footer" && <><Field label="Nombre del negocio" value="Echological" onChange={() => markDirty()} /><Toggle checked onChange={() => markDirty()} label="Mostrar redes sociales" /><Toggle checked onChange={() => markDirty()} label="Mostrar contacto" /></>}
        {selected === "utilities" && <><Toggle checked onChange={() => markDirty()} label="Selector de idioma" /><Toggle checked onChange={() => markDirty()} label="Aviso de privacidad" /></>}
      </div>
    </section>
  );
}

function AppsPanel({ markDirty }: { markDirty: () => void }) {
  const [connected, setConnected] = useState<Record<string, boolean>>({ reviews: true, chat: false, analytics: true, payments: false });
  const apps = [
    { id: "reviews", name: "Reseñas verificadas", description: "Muestra puntuaciones y comentarios de huéspedes." },
    { id: "chat", name: "Chat de huéspedes", description: "Añade atención directa dentro del sitio." },
    { id: "analytics", name: "Analítica de conversión", description: "Mide búsquedas, aperturas y reservas." },
    { id: "payments", name: "Pago acelerado", description: "Reduce los pasos del proceso de reserva." },
  ];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 h-14 border-b border-ink/10 bg-white px-4 py-4"><h1 className="font-display text-lg font-extrabold">Integraciones</h1></div>
      <div className="divide-y divide-ink/10">{apps.map((app) => <div key={app.id} className="p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-coral"><Icon name="apps" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{app.name}</p><p className="mt-1 text-xs leading-relaxed text-ink/50">{app.description}</p></div></div><button type="button" onClick={() => { setConnected((current) => ({ ...current, [app.id]: !current[app.id] })); markDirty(); }} className={`mt-3 h-9 w-full rounded-md border text-xs font-bold ${connected[app.id] ? "border-ink bg-ink text-white" : "border-ink/15 bg-white"}`}>{connected[app.id] ? "Conectado" : "Conectar"}</button></div>)}</div>
    </div>
  );
}

export function CatalogBuilder({ rentals, onBack }: { rentals: WebsiteRental[]; onBack?: () => void }) {
  const [editorMode, setEditorMode] = useState<EditorMode>("sections");
  const [selected, setSelected] = useState<EditorNode | null>("hero");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [theme, setTheme] = useState<ThemeSettings>(defaultThemeSettings);
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [title, setTitle] = useState("Encuentra tu próxima escapada");
  const [subtitle, setSubtitle] = useState("Alojamientos únicos para descansar, reconectar y reservar sin complicaciones.");
  const [announcement, setAnnouncement] = useState("Reserva directa con la mejor tarifa disponible");
  const [layout, setLayout] = useState<CatalogLayout>("grid");
  const [showMap, setShowMap] = useState(true);
  const [showPrices, setShowPrices] = useState(true);
  const [showAmenities, setShowAmenities] = useState(true);
  const [showPromo, setShowPromo] = useState(false);
  const [addedSectionName, setAddedSectionName] = useState("Mensaje destacado");
  const [dirty, setDirty] = useState(false);
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [expanded, setExpanded] = useState<Record<"header" | "hero" | "footer", boolean>>({ header: true, hero: true, footer: true });
  const [hiddenNodes, setHiddenNodes] = useState<Set<EditorNode>>(() => new Set());
  const [removedNodes, setRemovedNodes] = useState<Set<EditorNode>>(() => new Set());
  const [heroExtraBlocks, setHeroExtraBlocks] = useState<string[]>([]);
  const visibleRentals = useMemo(() => rentals.slice(0, 4), [rentals]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("hostflow-website-theme");
    if (!savedTheme) return;
    let parsedTheme: ThemeSettings;
    try {
      parsedTheme = { ...defaultThemeSettings, ...JSON.parse(savedTheme) };
    } catch {
      window.localStorage.removeItem("hostflow-website-theme");
      return;
    }
    const timeout = window.setTimeout(() => setTheme(parsedTheme), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const pageWidth = theme.pageWidth === "narrow" ? "max-w-[1120px]" : theme.pageWidth === "wide" ? "max-w-[1680px]" : "max-w-[1440px]";
  const headingLineHeight = theme.headingLineHeight === "tight" ? 1.05 : theme.headingLineHeight === "loose" ? 1.35 : 1.18;
  const letterSpacing = theme.letterSpacing === "wide" ? "0.06em" : "0";
  const iconStroke = theme.iconStroke === "thin" ? 1.25 : theme.iconStroke === "bold" ? 2.5 : 1.8;
  const cardHoverClass = theme.hoverEffect === "lift" ? "hover:-translate-y-1 hover:shadow-lg" : theme.hoverEffect === "zoom" ? "[&_.rental-artwork]:hover:scale-[1.04]" : "";
  const badgePositionClass = theme.badgePosition === "top-left" ? "left-2 top-2" : theme.badgePosition === "bottom-left" ? "bottom-2 left-2" : theme.badgePosition === "bottom-right" ? "bottom-2 right-2" : "right-2 top-2";
  const previewStyle = {
    backgroundColor: theme.pageBackground,
    color: theme.textColor,
    fontFamily: theme.bodyFont,
    fontSize: `${theme.baseFontSize}px`,
    "--hf-primary": theme.primaryColor,
    "--hf-surface": theme.surfaceColor,
    "--hf-text": theme.textColor,
    "--hf-muted": theme.mutedColor,
    "--hf-border": theme.borderColor,
    "--hf-heading-font": theme.headingFont,
    "--hf-icon-stroke": iconStroke,
  } as CSSProperties;

  function choose(node: EditorNode) { setSelected(node); }
  function toggleExpanded(section: "header" | "hero" | "footer") { setExpanded((current) => ({ ...current, [section]: !current[section] })); }
  function toggleVisibility(node: EditorNode) { setHiddenNodes((current) => { const next = new Set(current); if (next.has(node)) next.delete(node); else next.add(node); return next; }); setDirty(true); }
  function removeNode(node: EditorNode) { setRemovedNodes((current) => new Set(current).add(node)); if (selected === node) setSelected(null); setDirty(true); }
  function addFromLibrary(name: string) {
    if (picker === "section") {
      setShowPromo(true);
      setAddedSectionName(name);
      setRemovedNodes((current) => { const next = new Set(current); next.delete("promo"); return next; });
      setSelected("promo");
    } else {
      setHeroExtraBlocks((current) => current.includes(name) ? current : [...current, name]);
      setSelected("hero");
    }
    setPicker(null);
    setDirty(true);
  }
  function updateTheme(nextTheme: ThemeSettings) { setTheme(nextTheme); setDirty(true); }
  function saveChanges() {
    window.localStorage.setItem("hostflow-website-theme", JSON.stringify(theme));
    setDirty(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid min-h-0 grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-white text-ink">
      <header className="grid grid-cols-[310px_minmax(420px,1fr)_310px] border-b border-ink/10 bg-white">
        <div className="flex items-center gap-2 border-r border-ink/10 px-3">
          <button type="button" onClick={onBack} className="grid h-9 w-9 place-items-center rounded-md hover:bg-ink/[0.05]" aria-label="Volver a Sitio web"><Icon name="back" /></button>
          <button type="button" onClick={() => setEditorMode("sections")} className={`grid h-9 w-9 place-items-center rounded-md ${editorMode === "sections" ? "bg-coral" : "hover:bg-ink/[0.05]"}`} aria-label="Secciones"><Icon name="sections" /></button>
          <button type="button" onClick={() => setEditorMode("theme")} className={`grid h-9 w-9 place-items-center rounded-md ${editorMode === "theme" ? "bg-coral" : "hover:bg-ink/[0.05]"}`} aria-label="Ajustes de tema"><Icon name="settings" /></button>
          <button type="button" onClick={() => setEditorMode("apps")} className={`grid h-9 w-9 place-items-center rounded-md ${editorMode === "apps" ? "bg-coral" : "hover:bg-ink/[0.05]"}`} aria-label="Integraciones"><Icon name="apps" /></button>
        </div>
        <div className="flex min-w-0 items-center justify-center gap-8 px-4 text-sm">
          <button type="button" className="flex min-w-0 items-center gap-2 font-semibold"><Icon name="sections" /><span className="truncate">Echological</span><span className="rounded bg-[#eaf6e8] px-2 py-1 text-[10px] font-bold uppercase text-[#39723f]">Activo</span></button>
          <button type="button" className="flex min-w-0 items-center gap-2 font-semibold"><Icon name="home" /><span className="truncate">Página de inicio</span><span className="text-ink/45">⌄</span></button>
        </div>
        <div className="flex items-center justify-end gap-1 border-l border-ink/10 px-3">
          <button type="button" onClick={() => setPreviewMode("desktop")} className={`grid h-9 w-9 place-items-center rounded-md ${previewMode === "desktop" ? "bg-coral" : "hover:bg-ink/[0.05]"}`} aria-label="Vista de escritorio"><Icon name="desktop" /></button>
          <button type="button" onClick={() => setPreviewMode("mobile")} className={`grid h-9 w-9 place-items-center rounded-md ${previewMode === "mobile" ? "bg-coral" : "hover:bg-ink/[0.05]"}`} aria-label="Vista móvil"><Icon name="mobile" /></button>
          <span className="mx-1 h-6 w-px bg-ink/10" />
          <button type="button" disabled className="grid h-9 w-9 place-items-center rounded-md text-ink/20" aria-label="Deshacer"><Icon name="undo" /></button>
          <button type="button" disabled className="grid h-9 w-9 place-items-center rounded-md text-ink/20" aria-label="Rehacer"><Icon name="redo" /></button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md border border-ink/15" aria-label="Más acciones"><Icon name="more" /></button>
          <button type="button" onClick={saveChanges} className={`ml-1 h-9 rounded-md px-4 text-sm font-bold ${dirty ? "bg-ink text-white" : "bg-ink/10 text-ink/35"}`}>{dirty ? "Guardar" : "Guardado"}</button>
        </div>
      </header>

      <div className="grid min-h-0 grid-cols-[310px_minmax(560px,1fr)] overflow-x-auto">
        <aside className="flex min-h-0 flex-col border-r border-ink/10 bg-white">
          {editorMode === "theme" ? <ThemeSettingsPanel value={theme} onChange={updateTheme} /> : editorMode === "apps" ? <AppsPanel markDirty={() => setDirty(true)} /> : <>
          <div className={`${selected ? "max-h-[47%]" : "flex-1"} overflow-y-auto border-b border-ink/10 px-3 py-3`}>
            <div className="mb-2 flex items-center justify-between px-1"><h1 className="font-display text-lg font-extrabold">Página de inicio</h1><button type="button" className="text-ink/45"><Icon name="more" /></button></div>
            <p className="px-2 pb-1 pt-3 text-xs font-bold uppercase text-ink/45">Encabezado</p>
            {!removedNodes.has("announcement") && <TreeRow node="announcement" selected={selected === "announcement"} onSelect={choose} visible={!hiddenNodes.has("announcement")} onVisibility={() => toggleVisibility("announcement")} />}
            {!removedNodes.has("header") && <TreeRow node="header" selected={selected === "header"} onSelect={choose} expandable expanded={expanded.header} onToggle={() => toggleExpanded("header")} visible={!hiddenNodes.has("header")} onVisibility={() => toggleVisibility("header")} />}
            {expanded.header && !removedNodes.has("header") && <>
              <TreeRow node="logo" selected={selected === "logo"} nested={1} onSelect={choose} visible={!hiddenNodes.has("logo")} onVisibility={() => toggleVisibility("logo")} />
              <TreeRow node="menu" selected={selected === "menu"} nested={1} subtitle="Menú principal" onSelect={choose} visible={!hiddenNodes.has("menu")} onVisibility={() => toggleVisibility("menu")} />
            </>}
            <AddRow label="Agregar sección" onClick={() => setPicker("section")} />

            <p className="mt-4 px-2 pb-1 pt-3 text-xs font-bold uppercase text-ink/45">Plantilla</p>
            {!removedNodes.has("hero") && <TreeRow node="hero" selected={selected === "hero"} onSelect={choose} expandable expanded={expanded.hero} onToggle={() => toggleExpanded("hero")} visible={!hiddenNodes.has("hero")} onVisibility={() => toggleVisibility("hero")} removable onRemove={() => removeNode("hero")} />}
            {expanded.hero && !removedNodes.has("hero") && <>
              <TreeRow node="heading" selected={selected === "heading"} nested={1} subtitle={title} onSelect={choose} visible={!hiddenNodes.has("heading")} onVisibility={() => toggleVisibility("heading")} />
              <TreeRow node="button" selected={selected === "button"} nested={1} onSelect={choose} visible={!hiddenNodes.has("button")} onVisibility={() => toggleVisibility("button")} />
              {heroExtraBlocks.map((block) => <div key={block} className="group flex min-h-10 items-center gap-2 rounded-md py-2 pl-12 pr-2 text-sm hover:bg-ink/[0.04]"><Icon name="grip" className="h-4 w-4 text-ink/45" /><span className="min-w-0 flex-1 truncate font-semibold">{block}</span><button type="button" onClick={() => { setHeroExtraBlocks((current) => current.filter((item) => item !== block)); setDirty(true); }} className="grid h-7 w-7 place-items-center opacity-0 group-hover:opacity-100" aria-label={`Eliminar ${block}`}><Icon name="trash" /></button></div>)}
              <AddRow label="Agregar bloque" onClick={() => setPicker("block")} />
            </>}
            {!removedNodes.has("search") && <TreeRow node="search" selected={selected === "search"} onSelect={choose} visible={!hiddenNodes.has("search")} onVisibility={() => toggleVisibility("search")} removable onRemove={() => removeNode("search")} />}
            {!removedNodes.has("catalog") && <TreeRow node="catalog" selected={selected === "catalog"} onSelect={choose} visible={!hiddenNodes.has("catalog")} onVisibility={() => toggleVisibility("catalog")} removable onRemove={() => removeNode("catalog")} />}
            {!removedNodes.has("map") && <TreeRow node="map" selected={selected === "map"} onSelect={choose} visible={!hiddenNodes.has("map")} onVisibility={() => toggleVisibility("map")} removable onRemove={() => removeNode("map")} />}
            {showPromo && !removedNodes.has("promo") && <TreeRow node="promo" selected={selected === "promo"} subtitle={addedSectionName} onSelect={choose} visible={!hiddenNodes.has("promo")} onVisibility={() => toggleVisibility("promo")} removable onRemove={() => removeNode("promo")} />}
            <AddRow label="Agregar sección" onClick={() => setPicker("section")} />

            <p className="mt-4 px-2 pb-1 pt-3 text-xs font-bold uppercase text-ink/45">Pie de página</p>
            <AddRow label="Agregar sección" onClick={() => setPicker("section")} />
            <TreeRow node="footer" selected={selected === "footer"} onSelect={choose} expandable expanded={expanded.footer} onToggle={() => toggleExpanded("footer")} visible={!hiddenNodes.has("footer")} onVisibility={() => toggleVisibility("footer")} />
            {expanded.footer && <TreeRow node="utilities" selected={selected === "utilities"} nested={1} onSelect={choose} visible={!hiddenNodes.has("utilities")} onVisibility={() => toggleVisibility("utilities")} />}
          </div>
          {selected && <div className="min-h-0 flex-1 overflow-y-auto"><Inspector selected={selected} title={title} setTitle={setTitle} subtitle={subtitle} setSubtitle={setSubtitle} announcement={announcement} setAnnouncement={setAnnouncement} layout={layout} setLayout={setLayout} showMap={showMap} setShowMap={setShowMap} showPrices={showPrices} setShowPrices={setShowPrices} showAmenities={showAmenities} setShowAmenities={setShowAmenities} markDirty={() => setDirty(true)} close={() => setSelected(null)} /></div>}
          </>}
        </aside>

        <main className="min-h-0 overflow-auto bg-[#eef0f1] p-3">
          <div style={previewStyle} className={`hostflow-site-preview relative mx-auto min-h-full overflow-hidden border shadow-[0_16px_40px_rgba(17,17,17,0.10)] transition-all duration-300 ${theme.pageTransition ? "animate-[fadeIn_.25s_ease-out]" : ""} ${previewMode === "mobile" ? "w-[390px]" : `w-full ${pageWidth}`}`}>
            {theme.customCss && <style>{theme.customCss}</style>}
            {!removedNodes.has("announcement") && !hiddenNodes.has("announcement") && <SelectionFrame active={selected === "announcement"} label="Barra de anuncios" onClick={() => choose("announcement")}><div className="flex h-9 items-center justify-center px-4 text-xs font-semibold" style={{ backgroundColor: theme.textColor, color: theme.surfaceColor }}>{announcement}</div></SelectionFrame>}
            {!removedNodes.has("header") && !hiddenNodes.has("header") && <SelectionFrame active={selected === "header" || selected === "menu" || selected === "logo"} label={selected === "menu" ? "Menú" : selected === "logo" ? "Logo" : "Encabezado"} onClick={() => choose("header")}>
              <nav className="flex h-16 items-center gap-6 px-8 text-sm font-semibold" style={{ backgroundColor: theme.surfaceColor, borderColor: theme.borderColor }}>{!hiddenNodes.has("logo") && <button type="button" onClick={(event) => { event.stopPropagation(); choose("logo"); }} className="mr-auto flex items-center gap-3 text-xl font-extrabold" style={{ fontFamily: theme.headingFont }}>{theme.logoDataUrl ? <span role="img" aria-label={theme.storeName} className="block h-9 w-36 bg-contain bg-left bg-no-repeat" style={{ backgroundImage: `url(${theme.logoDataUrl})` }} /> : theme.storeName}</button>}{previewMode === "desktop" && !hiddenNodes.has("menu") && <button type="button" onClick={(event) => { event.stopPropagation(); choose("menu"); }} className="flex gap-6"><span>Inicio</span><span>Alojamientos</span><span>Experiencias</span><span>Contacto</span></button>}<Icon name="search" /><button type="button" onClick={(event) => { event.stopPropagation(); setCartOpen(true); }} className="relative" aria-label="Abrir carrito"><Icon name="cart" /><span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold" style={{ backgroundColor: theme.primaryColor, color: theme.textColor }}>1</span></button></nav>
            </SelectionFrame>}

            {!removedNodes.has("hero") && !hiddenNodes.has("hero") && <SelectionFrame active={selected === "hero" || selected === "heading" || selected === "button"} label={selected === "heading" ? "Encabezado" : selected === "button" ? "Botón" : "Portada"} onClick={() => choose("hero")}>
              <section className={`grid content-center bg-[linear-gradient(90deg,rgba(17,17,17,0.76),rgba(17,17,17,0.12)),radial-gradient(circle_at_72%_35%,#a7b487_0_10%,transparent_11%),linear-gradient(135deg,#33483a,#8c8a63)] px-10 text-white ${previewMode === "mobile" ? "min-h-96" : "min-h-[380px]"}`}>
                {!hiddenNodes.has("heading") && <button type="button" onClick={(event) => { event.stopPropagation(); choose("heading"); }} className="max-w-3xl text-left"><h2 className="font-extrabold" style={{ fontFamily: theme.headingFont, fontSize: previewMode === "mobile" ? `${Math.max(34, theme.h1Size * 0.68)}px` : `${theme.h1Size}px`, lineHeight: headingLineHeight, letterSpacing, textTransform: theme.uppercaseHeadings ? "uppercase" : "none" }}>{title}</h2><p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">{subtitle}</p></button>}
                {!hiddenNodes.has("button") && <button type="button" onClick={(event) => { event.stopPropagation(); choose("button"); }} className="mt-7 w-fit px-6 py-3 text-sm font-bold transition" style={{ backgroundColor: theme.primaryButtonBg, color: theme.primaryButtonText, borderColor: theme.primaryButtonBorder, borderWidth: theme.primaryButtonBorderWidth, borderRadius: theme.primaryButtonRadius, textTransform: theme.uppercaseButtons ? "uppercase" : "none" }}>Reservar ahora</button>}
                {heroExtraBlocks.map((block) => <div key={block} className="mt-4 w-fit rounded border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold">{block}</div>)}
              </section>
            </SelectionFrame>}

            {!removedNodes.has("search") && !hiddenNodes.has("search") && <SelectionFrame active={selected === "search"} label="Buscador" onClick={() => choose("search")}><section className={`grid gap-2 p-4 ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-[1fr_1fr_1fr_auto]"}`} style={{ backgroundColor: theme.surfaceColor }}>{["Llegada|15 jul 2026", "Salida|19 jul 2026", "Huéspedes|2 adultos"].map((item) => { const [label, content] = item.split("|"); return <div key={label} className="px-3 py-2" style={{ backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.inputBorder, borderWidth: theme.inputBorderWidth, borderRadius: theme.inputRadius }}><span className="text-[10px] uppercase" style={{ color: theme.mutedColor }}>{label}</span><p className="mt-1 text-xs font-semibold">{content}</p></div>; })}<button type="button" className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold" style={{ backgroundColor: theme.primaryButtonBg, color: theme.primaryButtonText, borderColor: theme.primaryButtonBorder, borderWidth: theme.primaryButtonBorderWidth, borderRadius: theme.primaryButtonRadius, textTransform: theme.uppercaseButtons ? "uppercase" : "none" }}><Icon name="search" />Buscar</button></section></SelectionFrame>}

            <section className={`grid gap-3 p-7 ${showMap && previewMode === "desktop" ? "grid-cols-[minmax(0,1fr)_34%]" : "grid-cols-1"}`} style={{ backgroundColor: theme.pageBackground }}>
              {!removedNodes.has("catalog") && !hiddenNodes.has("catalog") && <SelectionFrame active={selected === "catalog"} label="Alojamientos destacados" onClick={() => choose("catalog")}>
                <div className="p-3">
                  <div className={`mb-5 flex gap-4 ${previewMode === "mobile" ? "flex-col items-stretch" : "items-end justify-between"}`}>
                    <div><p className="text-xs font-bold uppercase" style={{ color: theme.mutedColor }}>Explora</p><h3 className="mt-1 font-extrabold" style={{ fontFamily: theme.headingFont, fontSize: `${theme.h2Size}px`, lineHeight: headingLineHeight, letterSpacing, textTransform: theme.uppercaseHeadings ? "uppercase" : "none" }}>Alojamientos disponibles</h3><p className="text-sm" style={{ color: theme.mutedColor }}>{rentals.length} resultados</p></div>
                    <button type="button" onClick={() => setFiltersOpen((current) => !current)} className={`px-4 py-2 text-xs font-bold ${previewMode === "mobile" ? "w-full" : ""}`} style={{ backgroundColor: theme.secondaryButtonBg, color: theme.secondaryButtonText, borderColor: theme.secondaryButtonBorder, borderWidth: theme.secondaryButtonBorderWidth, borderRadius: theme.secondaryButtonRadius, textTransform: theme.uppercaseButtons ? "uppercase" : "none" }}>Filtros</button>
                  </div>
                  {filtersOpen && <div className={`mb-4 grid gap-3 p-4 ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`} style={{ backgroundColor: theme.popoverBg, color: theme.popoverText, borderColor: theme.popoverBorder, borderWidth: theme.popoverBorderWidth, borderRadius: theme.searchCardRadius, boxShadow: theme.popoverShadow ? "0 12px 30px rgba(17,17,17,.12)" : "none" }}><label className="text-xs font-bold">Ubicación<input defaultValue="Comanja de Corona" className="mt-2 h-10 w-full px-3 font-normal outline-none" style={{ backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.inputBorder, borderWidth: theme.inputBorderWidth, borderRadius: theme.inputRadius }} /></label><label className="text-xs font-bold">Precio máximo<input type="number" defaultValue="2500" className="mt-2 h-10 w-full px-3 font-normal outline-none" style={{ backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.inputBorder, borderWidth: theme.inputBorderWidth, borderRadius: theme.inputRadius }} /></label><button type="button" className="mt-auto h-10 text-xs font-bold" style={{ backgroundColor: theme.primaryButtonBg, color: theme.primaryButtonText, borderRadius: theme.primaryButtonRadius }}>Aplicar filtros</button></div>}
                  <div className={`grid gap-3 ${layout === "list" || previewMode === "mobile" ? "grid-cols-1" : "grid-cols-2"}`}>
                    {visibleRentals.map((rental, index) => <article key={rental.id} className={`rental-card group relative ${layout === "list" && previewMode === "desktop" ? "grid grid-cols-[170px_minmax(0,1fr)]" : "block"} overflow-hidden border transition duration-300 ${cardHoverClass}`} style={{ backgroundColor: theme.cardBg, color: theme.cardText, borderColor: theme.borderColor, borderRadius: theme.cardRadius }}>
                      <div className="relative overflow-hidden"><RentalArtwork index={index} name={rental.name} />{theme.secondImageOnHover && <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(245,224,48,0.22),rgba(17,17,17,0.14))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}{theme.productCarousel && <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1"><i className="h-1.5 w-1.5 rounded-full bg-white" /><i className="h-1.5 w-1.5 rounded-full bg-white/45" /><i className="h-1.5 w-1.5 rounded-full bg-white/45" /></span>}</div>
                      <span className={`absolute ${badgePositionClass} px-2 py-1 text-[9px] font-bold uppercase`} style={{ backgroundColor: theme.badgeBg, color: theme.badgeText, borderRadius: theme.badgeRadius }}>Directo</span>
                      <div className="p-3">
                        <h4 className="truncate text-sm font-bold" style={{ textTransform: theme.uppercaseProductTitles ? "uppercase" : "none" }}>{rental.name}</h4>
                        {showAmenities && <p className="mt-1 text-xs" style={{ color: theme.mutedColor }}>2–4 huéspedes · Naturaleza</p>}
                        {index === 0 && <div className={`mt-3 flex gap-1.5 ${theme.variantButtonWidth === "fill" ? "[&>button]:flex-1" : ""}`} aria-label="Variantes de ocupación">
                          <button type="button" className="grid place-items-center text-[9px] font-bold" style={{ width: theme.variantButtonWidth === "fit" ? theme.swatchWidth : undefined, height: theme.swatchHeight, backgroundColor: theme.selectedVariantBg, color: theme.selectedVariantText, borderColor: theme.selectedVariantBorder, borderWidth: theme.variantButtonBorderWidth, borderRadius: theme.variantButtonRadius }}>2</button>
                          <button type="button" className="grid place-items-center text-[9px] font-bold" style={{ width: theme.variantButtonWidth === "fit" ? theme.swatchWidth : undefined, height: theme.swatchHeight, backgroundColor: theme.swatchVariantImages ? "#c5b98d" : theme.variantBg, color: theme.variantText, borderColor: theme.variantBorder, borderWidth: theme.swatchBorderWidth, borderRadius: theme.swatchRadius, opacity: Math.max(0.35, theme.swatchBorderOpacity / 100) }}>4</button>
                        </div>}
                        <div className="mt-4 flex items-center justify-between gap-2">{showPrices && <p className="text-sm font-bold">${rental.nightlyRate.toLocaleString("es-MX")}{theme.showCurrencyCards ? " MXN" : ""} <span className="text-[10px] font-normal" style={{ color: theme.mutedColor }}>/ noche</span></p>}{theme.quickAdd && (previewMode === "desktop" || theme.quickAddMobile) && <button type="button" onClick={() => setCartOpen(true)} className="px-3 py-2 text-[10px] font-bold" style={{ backgroundColor: theme.primaryButtonBg, color: theme.primaryButtonText, borderColor: theme.primaryButtonBorder, borderWidth: theme.primaryButtonBorderWidth, borderRadius: theme.primaryButtonRadius, textTransform: theme.uppercaseButtons ? "uppercase" : "none" }}>Reservar</button>}</div>
                      </div>
                    </article>)}
                  </div>
                </div>
              </SelectionFrame>}
              {showMap && !removedNodes.has("map") && !hiddenNodes.has("map") && <SelectionFrame active={selected === "map"} label="Mapa" onClick={() => choose("map")}><div className="relative min-h-80 bg-[#dfe8dc] [background-image:linear-gradient(32deg,transparent_46%,rgba(17,17,17,0.10)_47%,transparent_49%),linear-gradient(118deg,transparent_45%,rgba(17,17,17,0.08)_46%,transparent_48%)] [background-size:68px_68px,92px_92px]"><span className="absolute left-[30%] top-[28%] px-3 py-2 text-xs font-bold" style={{ backgroundColor: theme.primaryButtonBg, color: theme.primaryButtonText, borderRadius: theme.badgeRadius }}>$740</span><span className="absolute right-[18%] top-[55%] px-3 py-2 text-xs font-bold" style={{ backgroundColor: theme.primaryButtonBg, color: theme.primaryButtonText, borderRadius: theme.badgeRadius }}>$900</span><span className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 text-xs font-bold" style={{ backgroundColor: theme.popoverBg, color: theme.popoverText, borderColor: theme.popoverBorder, borderWidth: theme.popoverBorderWidth, borderRadius: theme.popoverRadius, boxShadow: theme.popoverShadow ? "0 12px 30px rgba(17,17,17,.15)" : "none" }}><Icon name="map" />Comanja de Corona</span></div></SelectionFrame>}
            </section>

            {showPromo && !removedNodes.has("promo") && !hiddenNodes.has("promo") && <SelectionFrame active={selected === "promo"} label={addedSectionName} onClick={() => choose("promo")}><section className="flex min-h-36 items-center justify-between gap-6 px-10" style={{ backgroundColor: theme.primaryColor, color: theme.textColor }}><div><p className="text-xs font-bold uppercase">{addedSectionName}</p><h3 className="mt-1 font-extrabold" style={{ fontFamily: theme.headingFont, fontSize: `${theme.h2Size}px`, textTransform: theme.uppercaseHeadings ? "uppercase" : "none" }}>Atención cercana, sin comisiones</h3></div><button type="button" className="px-5 py-3 text-sm font-bold" style={{ backgroundColor: theme.primaryButtonBg, color: theme.primaryButtonText, borderColor: theme.primaryButtonBorder, borderWidth: theme.primaryButtonBorderWidth, borderRadius: theme.primaryButtonRadius }}>Conocer más</button></section></SelectionFrame>}
            {!hiddenNodes.has("footer") && <SelectionFrame active={selected === "footer" || selected === "utilities"} label={selected === "utilities" ? "Utilidades" : "Pie de página"} onClick={() => choose("footer")}><footer className={`grid gap-8 px-10 py-10 ${previewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`} style={{ backgroundColor: theme.textColor, color: theme.surfaceColor }}><div><p className="text-xl font-extrabold" style={{ fontFamily: theme.headingFont }}>{theme.storeName}</p><p className="mt-2 text-sm opacity-55">Estancias para reconectar con la naturaleza.</p></div><div><p className="text-xs font-bold uppercase opacity-45">Explora</p><p className="mt-3 text-sm">Alojamientos<br />Experiencias<br />Contacto</p></div>{!hiddenNodes.has("utilities") && <button type="button" onClick={(event) => { event.stopPropagation(); choose("utilities"); }} className="self-start text-left text-sm opacity-60">Español · Privacidad · Términos</button>}</footer></SelectionFrame>}

            {cartOpen && <div className={`absolute inset-0 z-40 flex bg-ink/30 ${theme.cartType === "drawer" ? "justify-end" : "items-center justify-center p-6"}`} onClick={() => setCartOpen(false)}>
              <aside onClick={(event) => event.stopPropagation()} className={`${theme.cartType === "drawer" ? "h-full w-[340px]" : "w-full max-w-lg"} flex flex-col p-5`} style={{ backgroundColor: theme.drawerBg, color: theme.drawerText, borderColor: theme.drawerBorder, borderWidth: theme.drawerBorderWidth, borderRadius: theme.cartType === "drawer" ? `${theme.drawerRadius}px 0 0 ${theme.drawerRadius}px` : theme.popoverRadius, boxShadow: theme.drawerShadow ? "0 20px 60px rgba(17,17,17,.25)" : "none" }}>
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: theme.drawerBorder }}><div><p className="text-xs font-bold uppercase" style={{ color: theme.mutedColor }}>Tu reserva</p><h3 className="mt-1 text-xl font-extrabold" style={{ fontFamily: theme.headingFont }}>Glamping Luna</h3></div><button type="button" onClick={() => setCartOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border" style={{ borderColor: theme.drawerBorder }} aria-label="Cerrar carrito">×</button></div>
                <div className="flex-1 py-5"><div className="grid grid-cols-[84px_1fr] gap-3"><div className="bg-[linear-gradient(135deg,#33483a,#c1b782)]" style={{ borderRadius: theme.cardRadius }} /><div><p className="text-sm font-bold">2 noches · 2 huéspedes</p><p className="mt-1 text-xs" style={{ color: theme.mutedColor }}>15–17 julio de 2026</p><p className="mt-3 text-sm font-extrabold">$1,480{theme.showCurrencyCart ? " MXN" : ""}</p></div></div>{theme.cartNotes && <textarea placeholder="Nota para el anfitrión" className="mt-5 w-full p-3 text-sm outline-none" style={{ backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.inputBorder, borderWidth: theme.inputBorderWidth, borderRadius: theme.inputRadius }} />}{theme.cartDiscounts && <input placeholder="Código de descuento" className="mt-3 h-11 w-full px-3 text-sm outline-none" style={{ backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.inputBorder, borderWidth: theme.inputBorderWidth, borderRadius: theme.inputRadius }} />}</div>
                <div className="border-t pt-4" style={{ borderColor: theme.drawerBorder }}><div className="mb-4 flex items-center justify-between font-bold"><span>Total</span><span>$1,480{theme.showCurrencyTotal ? " MXN" : ""}</span></div><button type="button" className="h-12 w-full font-bold" style={{ backgroundColor: theme.primaryButtonBg, color: theme.primaryButtonText, borderColor: theme.primaryButtonBorder, borderWidth: theme.primaryButtonBorderWidth, borderRadius: theme.primaryButtonRadius, textTransform: theme.uppercaseButtons ? "uppercase" : "none" }}>{theme.acceleratedCheckout ? "Confirmar y pagar" : "Continuar"}</button>{theme.cartInstallments && <p className="mt-2 text-center text-xs" style={{ color: theme.mutedColor }}>Hasta 3 pagos sin intereses</p>}</div>
              </aside>
            </div>}
          </div>
        </main>
      </div>
      {picker && <LibraryPicker kind={picker} onClose={() => setPicker(null)} onAdd={addFromLibrary} />}
    </div>
  );
}
