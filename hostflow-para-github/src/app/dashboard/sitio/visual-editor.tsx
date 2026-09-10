"use client";

import { useMemo, useState, type ChangeEvent, type DragEvent } from "react";

export type BorderStyle = "sharp" | "rounded" | "pill";
export type ButtonStyle = "solid" | "outline";
export type PreviewMode = "desktop" | "mobile";
export type BlockType =
  | "headline"
  | "subheading"
  | "text"
  | "bullet-list"
  | "rich-text"
  | "button"
  | "form"
  | "image"
  | "video"
  | "html"
  | "booking";

export type ContentBlock = {
  id: string;
  type: BlockType;
  title: string;
  content: string;
};

export type SiteColumn = {
  id: string;
  blocks: ContentBlock[];
};

export type SiteRow = {
  id: string;
  columns: SiteColumn[];
};

export type SiteSection = {
  id: string;
  title: string;
  rows: SiteRow[];
};

export type DropPayload =
  | { kind: "new-block"; blockType: BlockType }
  | { kind: "new-row"; columns: number }
  | {
      kind: "block";
      blockId: string;
      sourceSectionId: string;
      sourceRowId: string;
      sourceColumnId: string;
    }
  | { kind: "row"; rowId: string; sourceSectionId: string };

export type DropTarget = {
  sectionId: string;
  rowId?: string;
  columnId?: string;
  beforeBlockId?: string;
  beforeRowId?: string;
};

export type PresetType = "hero" | "booking" | "contact";

const ITEM_MIME = "application/x-hostflow-builder-item";
const SECTION_MIME = "application/x-hostflow-section";

const elementCatalog: Array<{
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  group: "Text" | "Form" | "Media" | "Custom" | "Booking";
  badge?: string;
}> = [
  { type: "headline", label: "Headline", description: "Título principal", icon: "H", group: "Text" },
  { type: "subheading", label: "Sub-Headline", description: "Título secundario", icon: "T", group: "Text" },
  { type: "text", label: "Paragraph", description: "Texto y descripciones", icon: "¶", group: "Text" },
  { type: "bullet-list", label: "Bullet list", description: "Lista de beneficios", icon: "☷", group: "Text" },
  { type: "rich-text", label: "Rich Text", description: "Texto de formato libre", icon: "A", group: "Text", badge: "New" },
  { type: "button", label: "Button", description: "Llamado a la acción", icon: "▱", group: "Form" },
  { type: "form", label: "Form", description: "Captura datos del visitante", icon: "▣", group: "Form" },
  { type: "image", label: "Image", description: "Fotografía o gráfico", icon: "▧", group: "Media" },
  { type: "video", label: "Video", description: "Video incrustado", icon: "▶", group: "Media" },
  { type: "html", label: "Custom HTML", description: "Código y embeds", icon: "</>", group: "Custom" },
  { type: "booking", label: "Reservations", description: "Calendario de reservas", icon: "▦", group: "Booking" },
];

const quickAddCategories = [
  "Quick Add",
  "Sections",
  "Rows",
  "Elements",
  "Prebuilt Sections",
  "Saved Assets",
  "Widget Marketplace",
] as const;

type QuickAddCategory = (typeof quickAddCategories)[number];

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function fontFamily(name: string) {
  if (name === "Baloo") return "var(--font-display), sans-serif";
  if (name === "Inter") return "var(--font-sans), sans-serif";
  if (name === "Raleway") return "Raleway, var(--font-sans), sans-serif";
  return "Questrial, var(--font-sans), sans-serif";
}

function borderClass(style: BorderStyle) {
  if (style === "sharp") return "rounded-none";
  if (style === "rounded") return "rounded-lg";
  return "rounded-full";
}

function itemLabel(payload: DropPayload) {
  if (payload.kind === "new-row") return `${payload.columns} columnas`;
  if (payload.kind === "new-block") {
    return elementCatalog.find((item) => item.type === payload.blockType)?.label ?? "Elemento";
  }
  return payload.kind === "row" ? "Fila" : "Elemento";
}

function writePayload(event: DragEvent, payload: DropPayload) {
  event.dataTransfer.effectAllowed = payload.kind.startsWith("new-") ? "copy" : "move";
  event.dataTransfer.setData(ITEM_MIME, JSON.stringify(payload));
  event.dataTransfer.setData("text/plain", itemLabel(payload));
}

function readPayload(event: DragEvent): DropPayload | null {
  const value = event.dataTransfer.getData(ITEM_MIME);
  if (!value) return null;

  try {
    const payload = JSON.parse(value) as DropPayload;
    if (payload.kind === "new-row" && payload.columns >= 1 && payload.columns <= 6) return payload;
    if (
      payload.kind === "new-block" &&
      elementCatalog.some((item) => item.type === payload.blockType)
    ) {
      return payload;
    }
    if (
      payload.kind === "block" &&
      payload.blockId &&
      payload.sourceSectionId &&
      payload.sourceRowId &&
      payload.sourceColumnId
    ) {
      return payload;
    }
    if (payload.kind === "row" && payload.rowId && payload.sourceSectionId) return payload;
  } catch {
    return null;
  }

  return null;
}

export function createContentBlock(type: BlockType): ContentBlock {
  const defaults: Record<BlockType, { title: string; content: string }> = {
    headline: { title: "Headline", content: "Add a Title Here" },
    subheading: { title: "Sub-Headline", content: "Acompaña tu título con una idea clara" },
    text: { title: "Paragraph", content: "Escribe aquí el contenido de esta sección." },
    "bullet-list": { title: "Bullet list", content: "Primer beneficio\nSegundo beneficio\nTercer beneficio" },
    "rich-text": { title: "Rich Text", content: "Combina mensajes, detalles y llamadas a la acción en un mismo bloque." },
    button: { title: "Button", content: "Conocer más" },
    form: { title: "Form", content: "Déjanos tus datos" },
    image: { title: "Image", content: "" },
    video: { title: "Video", content: "" },
    html: {
      title: "Custom HTML",
      content: "<section style=\"padding:24px\"><h2>Tu contenido</h2><p>Pega aquí tu HTML.</p></section>",
    },
    booking: { title: "Reservations", content: "" },
  };

  return { id: id(type), type, ...defaults[type] };
}

export function createSiteRow(columns = 1, blocks: ContentBlock[] = []): SiteRow {
  return {
    id: id("row"),
    columns: Array.from({ length: columns }, (_, index) => ({
      id: id("column"),
      blocks: index === 0 ? blocks : [],
    })),
  };
}

export function createSiteSection(row?: SiteRow): SiteSection {
  return {
    id: id("section"),
    title: "Nueva sección",
    rows: row ? [row] : [],
  };
}

function RowTile({
  columns,
  active,
  onAdd,
  onBeginPointerDrag,
  onClearPointerDrag,
}: {
  columns: number;
  active: boolean;
  onAdd: () => void;
  onBeginPointerDrag: () => void;
  onClearPointerDrag: () => void;
}) {
  const payload: DropPayload = { kind: "new-row", columns };

  return (
    <div
      draggable
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        onBeginPointerDrag();
      }}
      onDragStart={(event) => {
        onClearPointerDrag();
        writePayload(event, payload);
      }}
      onDragEnd={onClearPointerDrag}
      className={`relative flex h-28 cursor-grab flex-col items-center justify-center rounded-md border bg-white px-3 transition hover:border-ink active:cursor-grabbing ${
        active ? "border-ink shadow-md" : "border-ink/15"
      }`}
      title={`Arrastra una fila de ${columns} columnas`}
    >
      <span className="absolute top-2 text-xs text-ink/25">⠿</span>
      <span
        className="mt-2 grid h-6 w-full gap-1 rounded border border-ink/10 bg-ink/[0.03] p-1"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <span key={index} className="rounded-sm bg-ink/15" />
        ))}
      </span>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 text-xs font-bold text-ink/70 hover:text-ink"
        aria-label={`Agregar fila de ${columns} columnas`}
      >
        {columns} {columns === 1 ? "columna" : "columnas"}
      </button>
    </div>
  );
}

function ElementTile({
  item,
  active,
  onAdd,
  onBeginPointerDrag,
  onClearPointerDrag,
}: {
  item: (typeof elementCatalog)[number];
  active: boolean;
  onAdd: () => void;
  onBeginPointerDrag: () => void;
  onClearPointerDrag: () => void;
}) {
  const payload: DropPayload = { kind: "new-block", blockType: item.type };

  return (
    <div
      draggable
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        onBeginPointerDrag();
      }}
      onDragStart={(event) => {
        onClearPointerDrag();
        writePayload(event, payload);
      }}
      onDragEnd={onClearPointerDrag}
      className={`relative flex h-36 cursor-grab flex-col items-center justify-center rounded-md border bg-white p-3 text-center transition hover:border-ink active:cursor-grabbing ${
        active ? "border-ink shadow-md" : "border-ink/15"
      }`}
      title={`Arrastra ${item.label} al lienzo`}
    >
      <span className="absolute top-2 text-xs text-ink/25">⠿</span>
      {item.badge && (
        <span className="absolute -right-2 -top-2 rounded-full bg-yellow px-2 py-1 text-[10px] font-bold text-ink">
          {item.badge}
        </span>
      )}
      <span className="mt-2 grid h-10 min-w-10 place-items-center font-mono text-2xl font-bold text-ink/70">
        {item.icon}
      </span>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 text-sm font-bold text-ink/75 hover:text-ink"
        aria-label={`Agregar elemento ${item.label}`}
      >
        {item.label}
      </button>
    </div>
  );
}

function QuickAddDrawer({
  category,
  setCategory,
  query,
  setQuery,
  pointerPayload,
  selectedSectionId,
  close,
  addBlock,
  addRow,
  addPreset,
  beginPointerDrag,
  clearPointerDrag,
}: {
  category: QuickAddCategory;
  setCategory: (value: QuickAddCategory) => void;
  query: string;
  setQuery: (value: string) => void;
  pointerPayload: DropPayload | null;
  selectedSectionId: string | null;
  close: () => void;
  addBlock: (type: BlockType, sectionId?: string) => void;
  addRow: (columns: number, sectionId?: string) => void;
  addPreset: (preset: PresetType) => void;
  beginPointerDrag: (payload: DropPayload) => void;
  clearPointerDrag: () => void;
}) {
  const filteredElements = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return elementCatalog.filter((item) => {
      if (category === "Widget Marketplace" && item.type !== "booking") return false;
      if (category === "Elements" && item.type === "booking") return false;
      if (!normalized) return true;
      return `${item.label} ${item.description} ${item.group}`.toLowerCase().includes(normalized);
    });
  }, [category, query]);

  const showRows = category === "Quick Add" || category === "Rows";
  const showElements =
    category === "Quick Add" ||
    category === "Elements" ||
    category === "Widget Marketplace";
  const showPresets = category === "Sections" || category === "Prebuilt Sections";

  return (
    <div
      data-testid="quick-add-drawer"
      className="absolute inset-y-0 left-0 z-30 flex w-[min(640px,calc(100vw-260px))] overflow-hidden border-r border-ink/10 bg-white shadow-[20px_0_45px_rgba(17,17,17,0.12)] max-xl:fixed max-xl:inset-y-[54px] max-xl:left-[58px] max-xl:w-[calc(100vw-58px)]"
    >
      <nav className="w-44 shrink-0 border-r border-ink/10 bg-[#fafafa] p-3 max-sm:w-28 max-sm:p-2">
        {quickAddCategories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setCategory(item);
              setQuery("");
            }}
            className={`mb-1 w-full rounded-md px-3 py-3 text-left text-xs font-bold transition max-sm:px-2 max-sm:text-[10px] ${
              category === item ? "bg-ink/[0.055] text-ink" : "text-ink/60 hover:bg-ink/[0.03]"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-ink/10 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">{category}</h2>
            <button
              type="button"
              onClick={close}
              className="grid h-8 w-8 place-items-center rounded-md text-xl text-ink/50 hover:bg-ink/5 hover:text-ink"
              aria-label="Cerrar Quick Add"
            >
              ×
            </button>
          </div>
          <label className="relative mt-4 block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-md border border-ink/15 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-ink"
              placeholder="Buscar elementos"
              aria-label="Buscar elementos"
            />
          </label>
        </div>

        <div className="space-y-8 p-5">
          {showRows && (
            <section>
              <h3 className="text-sm font-bold text-ink">Filas</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => index + 1).map((columns) => (
                  <RowTile
                    key={columns}
                    columns={columns}
                    active={pointerPayload?.kind === "new-row" && pointerPayload.columns === columns}
                    onAdd={() => addRow(columns, selectedSectionId ?? undefined)}
                    onBeginPointerDrag={() => beginPointerDrag({ kind: "new-row", columns })}
                    onClearPointerDrag={clearPointerDrag}
                  />
                ))}
              </div>
            </section>
          )}

          {showPresets && (
            <section>
              <h3 className="text-sm font-bold text-ink">Secciones prediseñadas</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  ["hero", "Hero", "Título, texto y botón"],
                  ["booking", "Reservas", "Calendario completo"],
                  ["contact", "Contacto", "Texto y formulario"],
                ].map(([value, label, description]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => addPreset(value as PresetType)}
                    className="min-h-28 rounded-md border border-ink/15 bg-white p-4 text-left hover:border-ink"
                  >
                    <span className="block text-sm font-bold text-ink">{label}</span>
                    <span className="mt-2 block text-xs text-ink/45">{description}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {showElements &&
            (["Text", "Form", "Media", "Custom", "Booking"] as const).map((group) => {
              const items = filteredElements.filter((item) => item.group === group);
              if (items.length === 0) return null;
              return (
                <section key={group}>
                  <h3 className="text-sm font-bold text-ink">{group === "Booking" ? "Reservas" : group}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {items.map((item) => (
                      <ElementTile
                        key={item.type}
                        item={item}
                        active={
                          pointerPayload?.kind === "new-block" &&
                          pointerPayload.blockType === item.type
                        }
                        onAdd={() => addBlock(item.type, selectedSectionId ?? undefined)}
                        onBeginPointerDrag={() =>
                          beginPointerDrag({ kind: "new-block", blockType: item.type })
                        }
                        onClearPointerDrag={clearPointerDrag}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

          {category === "Saved Assets" && (
            <div className="rounded-md border border-dashed border-ink/20 p-8 text-center">
              <p className="text-sm font-bold text-ink">Todavía no hay elementos guardados</p>
              <p className="mt-2 text-xs text-ink/45">Tus filas y secciones reutilizables aparecerán aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SectionsPanel({
  sections,
  selectedSectionId,
  pointerPayload,
  addSection,
  addBlock,
  addRow,
  addPreset,
  beginPointerDrag,
  clearPointerDrag,
  selectSection,
  removeSection,
  moveSection,
}: {
  sections: SiteSection[];
  selectedSectionId: string | null;
  pointerPayload: DropPayload | null;
  addSection: () => void;
  addBlock: (type: BlockType, sectionId?: string) => void;
  addRow: (columns: number, sectionId?: string) => void;
  addPreset: (preset: PresetType) => void;
  beginPointerDrag: (payload: DropPayload) => void;
  clearPointerDrag: () => void;
  selectSection: (id: string) => void;
  removeSection: (id: string) => void;
  moveSection: (sourceId: string, targetId: string) => void;
}) {
  const [quickAddOpen, setQuickAddOpen] = useState(true);
  const [category, setCategory] = useState<QuickAddCategory>("Quick Add");
  const [query, setQuery] = useState("");

  return (
    <div className="relative min-h-0 overflow-visible border-r border-ink/10 bg-white">
      <aside className="h-full min-h-0 overflow-y-auto px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink">Página</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink/50">
              Secciones, filas y elementos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink text-xl text-white"
            aria-label="Abrir Quick Add"
            title="Quick Add"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => setQuickAddOpen(true)}
          className="mt-7 flex w-full items-center justify-between rounded-md border border-ink/15 bg-white px-4 py-4 text-left hover:border-ink"
        >
          <span>
            <span className="block text-sm font-bold text-ink">Quick Add</span>
            <span className="mt-1 block text-xs text-ink/45">Agrega filas, contenido y widgets</span>
          </span>
          <span className="text-xl">+</span>
        </button>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-ink/40">Estructura de página</p>
            <span className="text-xs text-ink/35">{sections.length}</span>
          </div>

          <div className="mt-3 space-y-2">
            {sections.length === 0 ? (
              <button
                type="button"
                onClick={addSection}
                className="w-full rounded-md border border-dashed border-ink/20 px-4 py-8 text-sm text-ink/45 hover:border-ink/50 hover:text-ink"
              >
                + Agregar la primera sección
              </button>
            ) : (
              sections.map((section, index) => {
                const blockCount = section.rows.reduce(
                  (total, row) =>
                    total + row.columns.reduce((sum, column) => sum + column.blocks.length, 0),
                  0
                );
                return (
                  <div
                    key={section.id}
                    onDragOver={(event) => {
                      if (event.dataTransfer.types.includes(SECTION_MIME)) event.preventDefault();
                    }}
                    onDrop={(event) => {
                      const sourceId = event.dataTransfer.getData(SECTION_MIME);
                      if (sourceId && sourceId !== section.id) {
                        event.preventDefault();
                        moveSection(sourceId, section.id);
                      }
                    }}
                    className={`flex items-center gap-3 rounded-md border px-3 py-3 ${
                      selectedSectionId === section.id
                        ? "border-ink bg-ink/[0.035]"
                        : "border-ink/10 bg-white"
                    }`}
                  >
                    <span
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(SECTION_MIME, section.id);
                      }}
                      className="cursor-grab text-ink/25 active:cursor-grabbing"
                      title="Arrastrar sección"
                    >
                      ⠿
                    </span>
                    <button
                      type="button"
                      onClick={() => selectSection(section.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-bold text-ink">
                        {index + 1}. {section.title}
                      </span>
                      <span className="text-xs text-ink/40">
                        {section.rows.length} {section.rows.length === 1 ? "fila" : "filas"} · {blockCount} elementos
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="grid h-7 w-7 place-items-center rounded text-ink/35 hover:bg-ink/5 hover:text-ink"
                      aria-label={`Eliminar ${section.title}`}
                      title="Eliminar sección"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </aside>

      {quickAddOpen && (
        <QuickAddDrawer
          category={category}
          setCategory={setCategory}
          query={query}
          setQuery={setQuery}
          pointerPayload={pointerPayload}
          selectedSectionId={selectedSectionId}
          close={() => setQuickAddOpen(false)}
          addBlock={addBlock}
          addRow={addRow}
          addPreset={addPreset}
          beginPointerDrag={beginPointerDrag}
          clearPointerDrag={clearPointerDrag}
        />
      )}
    </div>
  );
}

function BookingWidget({
  compact,
  buttonColor,
  border,
  buttonFont,
}: {
  compact: boolean;
  buttonColor: string;
  border: BorderStyle;
  buttonFont: string;
}) {
  const [selectedDay, setSelectedDay] = useState(18);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [selectedGuests, setSelectedGuests] = useState("1 adulto");
  const [submitted, setSubmitted] = useState(false);
  const days = Array.from({ length: 30 }, (_, index) => index + 1);

  return (
    <div className="rounded-md bg-white p-5 text-ink shadow-[0_14px_34px_rgba(17,17,17,0.12)]">
      <div className={compact ? "space-y-5" : "grid grid-cols-[1fr_220px] gap-6"}>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Selecciona una fecha</h3>
            <span className="text-xs text-ink/45">Julio 2026</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-ink/35">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  setSubmitted(false);
                }}
                aria-pressed={selectedDay === day}
                aria-label={`${day} de julio`}
                className={`aspect-square rounded-md text-xs font-semibold ${
                  selectedDay === day ? "bg-ink text-white" : "hover:bg-ink/5"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block">
            <span className="text-[10px] font-bold uppercase text-ink/40">Hora</span>
            <select
              value={selectedTime}
              onChange={(event) => {
                setSelectedTime(event.target.value);
                setSubmitted(false);
              }}
              className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 text-xs"
            >
              <option>10:00 AM</option>
              <option>12:00 PM</option>
              <option>4:00 PM</option>
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-[10px] font-bold uppercase text-ink/40">Huéspedes</span>
            <select
              value={selectedGuests}
              onChange={(event) => {
                setSelectedGuests(event.target.value);
                setSubmitted(false);
              }}
              className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 text-xs"
            >
              <option>1 adulto</option>
              <option>2 adultos</option>
              <option>Familia</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className={`mt-5 w-full border px-4 py-3 text-xs font-bold ${borderClass(border)}`}
            style={{
              backgroundColor: buttonColor,
              borderColor: buttonColor,
              fontFamily: fontFamily(buttonFont),
            }}
          >
            Reservar ahora
          </button>
          {submitted && (
            <p role="status" className="mt-3 text-xs font-semibold leading-relaxed text-green-800">
              Selección lista: {selectedDay} de julio, {selectedTime} · {selectedGuests}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function HtmlPreview({ html }: { html: string }) {
  const document = `<!doctype html><html><head><meta name="viewport" content="width=device-width"><style>body{margin:0;padding:0;color:#111;font-family:Arial,sans-serif}*{box-sizing:border-box}img{max-width:100%;height:auto}</style></head><body>${html}</body></html>`;
  return (
    <iframe
      title="Vista previa de HTML"
      sandbox=""
      srcDoc={document}
      className="h-52 w-full rounded-md border border-ink/10 bg-white"
    />
  );
}

function videoEmbedUrl(value: string) {
  if (!value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.includes("youtube.com")) {
      const idValue = url.searchParams.get("v");
      return idValue ? `https://www.youtube.com/embed/${idValue}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

type BlockMutationProps = {
  onDropItem: (payload: DropPayload, target: DropTarget) => void;
  onUpdateBlock: (
    sectionId: string,
    rowId: string,
    columnId: string,
    blockId: string,
    patch: Partial<ContentBlock>
  ) => void;
  onRemoveBlock: (
    sectionId: string,
    rowId: string,
    columnId: string,
    blockId: string
  ) => void;
};

function EditableBlock({
  block,
  sectionId,
  rowId,
  columnId,
  compact,
  editing,
  buttonColor,
  border,
  buttonFont,
  paragraphFont,
  headingFont,
  onDropItem,
  onUpdateBlock,
  onRemoveBlock,
}: {
  block: ContentBlock;
  sectionId: string;
  rowId: string;
  columnId: string;
  compact: boolean;
  editing: boolean;
  buttonColor: string;
  border: BorderStyle;
  buttonFont: string;
  paragraphFont: string;
  headingFont: string;
} & BlockMutationProps) {
  function update(patch: Partial<ContentBlock>) {
    onUpdateBlock(sectionId, rowId, columnId, block.id, patch);
  }

  function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") update({ content: reader.result, title: file.name });
    };
    reader.readAsDataURL(file);
  }

  const embedUrl = block.type === "video" ? videoEmbedUrl(block.content) : null;
  const singleLineTypes: BlockType[] = ["headline", "subheading", "button"];

  return (
    <div
      onDragOver={(event) => {
        if (editing && event.dataTransfer.types.includes(ITEM_MIME)) event.preventDefault();
      }}
      onDrop={(event) => {
        if (!editing) return;
        const payload = readPayload(event);
        if (!payload) return;
        event.preventDefault();
        event.stopPropagation();
        onDropItem(payload, { sectionId, rowId, columnId, beforeBlockId: block.id });
      }}
      className={`group/block relative ${
        editing ? "rounded-md border border-transparent p-2 hover:border-ink/20 hover:bg-white/70" : ""
      }`}
    >
      {editing && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <span
            draggable
            onDragStart={(event) => {
              event.stopPropagation();
              writePayload(event, {
                kind: "block",
                blockId: block.id,
                sourceSectionId: sectionId,
                sourceRowId: rowId,
                sourceColumnId: columnId,
              });
            }}
            className="cursor-grab text-[10px] font-bold uppercase text-ink/35 active:cursor-grabbing"
            title="Arrastrar elemento"
          >
            ⠿ {block.title}
          </span>
          <button
            type="button"
            onClick={() => onRemoveBlock(sectionId, rowId, columnId, block.id)}
            className="grid h-6 w-6 place-items-center rounded text-ink/35 hover:bg-ink/5 hover:text-ink"
            aria-label={`Eliminar elemento ${block.title}`}
          >
            ×
          </button>
        </div>
      )}

      {singleLineTypes.includes(block.type) &&
        (editing ? (
          <input
            value={block.content}
            onChange={(event) => update({ content: event.target.value })}
            className={`w-full bg-transparent text-ink outline-none ${
              block.type === "headline"
                ? "text-center text-3xl font-extrabold"
                : block.type === "subheading"
                  ? "text-center text-xl font-semibold"
                  : `border px-5 py-3 text-center text-sm font-bold ${borderClass(border)}`
            }`}
            style={
              block.type === "button"
                ? {
                    backgroundColor: buttonColor,
                    borderColor: buttonColor,
                    fontFamily: fontFamily(buttonFont),
                  }
                : { fontFamily: fontFamily(headingFont) }
            }
            aria-label={`Editar ${block.title}`}
          />
        ) : block.type === "headline" ? (
          <h2 className="text-center text-3xl font-extrabold text-ink" style={{ fontFamily: fontFamily(headingFont) }}>
            {block.content}
          </h2>
        ) : block.type === "subheading" ? (
          <h3 className="text-center text-xl font-semibold text-ink" style={{ fontFamily: fontFamily(headingFont) }}>
            {block.content}
          </h3>
        ) : (
          <button
            type="button"
            className={`mx-auto block border px-5 py-3 text-sm font-bold ${borderClass(border)}`}
            style={{ backgroundColor: buttonColor, borderColor: buttonColor, fontFamily: fontFamily(buttonFont) }}
          >
            {block.content}
          </button>
        ))}

      {(block.type === "text" || block.type === "rich-text") &&
        (editing ? (
          <textarea
            value={block.content}
            onChange={(event) => update({ content: event.target.value })}
            rows={block.type === "rich-text" ? 6 : 4}
            className="w-full resize-y rounded-md border border-ink/15 bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-ink"
            style={{ fontFamily: fontFamily(paragraphFont) }}
            placeholder="Escribe tu texto..."
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink" style={{ fontFamily: fontFamily(paragraphFont) }}>
            {block.content}
          </p>
        ))}

      {block.type === "bullet-list" &&
        (editing ? (
          <textarea
            value={block.content}
            onChange={(event) => update({ content: event.target.value })}
            rows={5}
            className="w-full resize-y rounded-md border border-ink/15 bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-ink"
            placeholder="Una viñeta por línea"
          />
        ) : (
          <ul className="list-disc space-y-2 pl-6 text-sm text-ink">
            {block.content.split("\n").filter(Boolean).map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        ))}

      {block.type === "form" && (
        <div className="rounded-md border border-ink/10 bg-white p-4 text-ink">
          <p className="text-sm font-bold">{block.content}</p>
          <div className="mt-4 grid gap-3">
            <input className="h-10 rounded-md border border-ink/15 px-3 text-xs" placeholder="Nombre" />
            <input className="h-10 rounded-md border border-ink/15 px-3 text-xs" placeholder="Correo electrónico" />
            <button
              type="button"
              className={`border px-4 py-3 text-xs font-bold ${borderClass(border)}`}
              style={{ backgroundColor: buttonColor, borderColor: buttonColor }}
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      {block.type === "html" && (
        <div className="space-y-3">
          {editing && (
            <textarea
              value={block.content}
              onChange={(event) => update({ content: event.target.value })}
              rows={6}
              className="w-full resize-y rounded-md border border-ink/15 bg-[#151515] px-4 py-3 font-mono text-xs leading-relaxed text-white outline-none focus:border-ink"
              spellCheck={false}
              placeholder="Pega tu HTML aquí..."
            />
          )}
          <HtmlPreview html={block.content} />
        </div>
      )}

      {block.type === "image" && (
        <div>
          {block.content ? (
            <div className="relative overflow-hidden rounded-md bg-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.content} alt={block.title} className="max-h-[360px] w-full object-cover" />
              {editing && (
                <label className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-lg">
                  Cambiar imagen
                  <input type="file" accept="image/*" onChange={uploadImage} className="sr-only" />
                </label>
              )}
            </div>
          ) : (
            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-ink/25 bg-white/75 px-6 text-center hover:border-ink/50">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink/5 text-xl text-ink">↑</span>
              <span className="mt-3 text-sm font-bold text-ink">Subir una imagen</span>
              <span className="mt-1 text-xs text-ink/45">PNG, JPG o GIF</span>
              <input type="file" accept="image/*" onChange={uploadImage} className="sr-only" />
            </label>
          )}
        </div>
      )}

      {block.type === "video" && (
        <div className="space-y-3">
          {editing && (
            <input
              value={block.content}
              onChange={(event) => update({ content: event.target.value })}
              className="h-10 w-full rounded-md border border-ink/15 px-3 text-xs text-ink outline-none focus:border-ink"
              placeholder="Pega una URL de YouTube"
            />
          )}
          {embedUrl ? (
            <iframe
              title="Video"
              src={embedUrl}
              className="aspect-video w-full rounded-md border-0"
              allowFullScreen
            />
          ) : (
            <div className="grid aspect-video place-items-center rounded-md border border-dashed border-ink/20 bg-ink/5 text-center text-xs text-ink/45">
              Agrega una URL de YouTube
            </div>
          )}
        </div>
      )}

      {block.type === "booking" && (
        <BookingWidget compact={compact} buttonColor={buttonColor} border={border} buttonFont={buttonFont} />
      )}
    </div>
  );
}

function EditableRow({
  row,
  sectionId,
  compact,
  editing,
  pointerPayload,
  buttonColor,
  border,
  buttonFont,
  paragraphFont,
  headingFont,
  onDropItem,
  onUpdateBlock,
  onRemoveBlock,
  onRemoveRow,
  clearPointerDrag,
}: {
  row: SiteRow;
  sectionId: string;
  compact: boolean;
  editing: boolean;
  pointerPayload: DropPayload | null;
  buttonColor: string;
  border: BorderStyle;
  buttonFont: string;
  paragraphFont: string;
  headingFont: string;
  onRemoveRow: (sectionId: string, rowId: string) => void;
  clearPointerDrag: () => void;
} & BlockMutationProps) {
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  return (
    <div
      onDragOver={(event) => {
        if (editing && event.dataTransfer.types.includes(ITEM_MIME)) event.preventDefault();
      }}
      onDrop={(event) => {
        if (!editing) return;
        const payload = readPayload(event);
        if (!payload || (payload.kind !== "new-row" && payload.kind !== "row")) return;
        event.preventDefault();
        event.stopPropagation();
        onDropItem(payload, { sectionId, beforeRowId: row.id });
      }}
      className={`relative ${editing ? "rounded-md border border-dashed border-[#34b94b]/70 bg-white/70 p-3" : ""}`}
    >
      {editing && (
        <div className="mb-2 flex items-center justify-between">
          <span
            draggable
            onDragStart={(event) =>
              writePayload(event, { kind: "row", rowId: row.id, sourceSectionId: sectionId })
            }
            className="cursor-grab text-[10px] font-bold uppercase text-[#27973a] active:cursor-grabbing"
            title="Arrastrar fila"
          >
            ⠿ Fila · {row.columns.length} {row.columns.length === 1 ? "columna" : "columnas"}
          </span>
          <button
            type="button"
            onClick={() => onRemoveRow(sectionId, row.id)}
            className="grid h-6 w-6 place-items-center rounded text-ink/35 hover:bg-ink/5 hover:text-ink"
            aria-label="Eliminar fila"
          >
            ×
          </button>
        </div>
      )}

      <div
        className="grid items-start gap-3"
        style={{ gridTemplateColumns: compact ? "1fr" : `repeat(${row.columns.length}, minmax(0, 1fr))` }}
      >
        {row.columns.map((column) => (
          <div
            key={column.id}
            data-column-id={column.id}
            onPointerUp={(event) => {
              if (!editing || !pointerPayload) return;
              event.preventDefault();
              event.stopPropagation();
              onDropItem(pointerPayload, { sectionId, rowId: row.id, columnId: column.id });
              clearPointerDrag();
            }}
            onDragOver={(event) => {
              if (!editing || !event.dataTransfer.types.includes(ITEM_MIME)) return;
              event.preventDefault();
              event.stopPropagation();
              setDragOverColumnId(column.id);
            }}
            onDragLeave={() => setDragOverColumnId(null)}
            onDrop={(event) => {
              if (!editing) return;
              const payload = readPayload(event);
              if (!payload || payload.kind === "new-row" || payload.kind === "row") return;
              event.preventDefault();
              event.stopPropagation();
              setDragOverColumnId(null);
              onDropItem(payload, { sectionId, rowId: row.id, columnId: column.id });
              clearPointerDrag();
            }}
            className={`min-w-0 rounded-md ${
              editing
                ? `min-h-28 border border-dashed p-2 transition ${
                    dragOverColumnId === column.id || pointerPayload
                      ? "border-ink/50 bg-[#fffbe8]"
                      : "border-ink/15 bg-white/55"
                  }`
                : ""
            }`}
          >
            {column.blocks.length === 0 ? (
              editing && (
                <div className="grid min-h-24 place-items-center text-center text-[11px] text-ink/35">
                  Suelta un elemento aquí
                </div>
              )
            ) : (
              <div className="space-y-2">
                {column.blocks.map((block) => (
                  <EditableBlock
                    key={block.id}
                    block={block}
                    sectionId={sectionId}
                    rowId={row.id}
                    columnId={column.id}
                    compact={compact}
                    editing={editing}
                    buttonColor={buttonColor}
                    border={border}
                    buttonFont={buttonFont}
                    paragraphFont={paragraphFont}
                    headingFont={headingFont}
                    onDropItem={onDropItem}
                    onUpdateBlock={onUpdateBlock}
                    onRemoveBlock={onRemoveBlock}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditableSection({
  section,
  compact,
  editing,
  selected,
  pointerPayload,
  buttonColor,
  border,
  buttonFont,
  paragraphFont,
  headingFont,
  onSelect,
  onUpdateSection,
  onRemoveSection,
  onMoveSection,
  onDropItem,
  onUpdateBlock,
  onRemoveBlock,
  onRemoveRow,
  clearPointerDrag,
}: {
  section: SiteSection;
  compact: boolean;
  editing: boolean;
  selected: boolean;
  pointerPayload: DropPayload | null;
  buttonColor: string;
  border: BorderStyle;
  buttonFont: string;
  paragraphFont: string;
  headingFont: string;
  onSelect: (id: string) => void;
  onUpdateSection: (id: string, patch: Partial<SiteSection>) => void;
  onRemoveSection: (id: string) => void;
  onMoveSection: (sourceId: string, targetId: string) => void;
  onRemoveRow: (sectionId: string, rowId: string) => void;
  clearPointerDrag: () => void;
} & BlockMutationProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <section
      onClick={() => editing && onSelect(section.id)}
      onPointerUp={(event) => {
        if (!editing || !pointerPayload || (event.target as HTMLElement).closest("[data-column-id]")) return;
        event.preventDefault();
        event.stopPropagation();
        onDropItem(pointerPayload, { sectionId: section.id });
        clearPointerDrag();
      }}
      onDragOver={(event) => {
        if (!editing) return;
        if (event.dataTransfer.types.includes(ITEM_MIME) || event.dataTransfer.types.includes(SECTION_MIME)) {
          event.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(false);
      }}
      onDrop={(event) => {
        if (!editing) return;
        setDragOver(false);
        const sourceSectionId = event.dataTransfer.getData(SECTION_MIME);
        if (sourceSectionId && sourceSectionId !== section.id) {
          event.preventDefault();
          onMoveSection(sourceSectionId, section.id);
          return;
        }
        const payload = readPayload(event);
        if (!payload) return;
        event.preventDefault();
        onDropItem(payload, { sectionId: section.id });
        clearPointerDrag();
      }}
      className={`relative bg-[#f7f5ef] ${compact ? "px-4 py-6" : "px-8 py-8"} ${
        editing
          ? `m-3 rounded-md border-2 border-dashed transition ${
              dragOver ? "border-ink bg-[#fffbe8]" : selected ? "border-[#34b94b]" : "border-ink/20"
            }`
          : "border-t border-ink/10"
      }`}
    >
      {editing && (
        <div className="mb-4 flex items-center gap-3 border-b border-ink/10 pb-3 text-ink">
          <span
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData(SECTION_MIME, section.id);
            }}
            className="cursor-grab text-ink/30 active:cursor-grabbing"
            title="Arrastrar sección"
          >
            ⠿
          </span>
          <input
            value={section.title}
            onChange={(event) => onUpdateSection(section.id, { title: event.target.value })}
            onClick={(event) => event.stopPropagation()}
            className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
            aria-label="Nombre de la sección"
          />
          <span className="rounded bg-[#34b94b] px-2 py-0.5 text-[10px] font-bold text-white">Section</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveSection(section.id);
            }}
            className="grid h-7 w-7 place-items-center rounded text-ink/35 hover:bg-ink/5 hover:text-ink"
            aria-label={`Eliminar ${section.title}`}
          >
            ×
          </button>
        </div>
      )}

      {section.rows.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-ink/25 bg-white/55 px-6 text-center text-ink">
          <span className="text-2xl text-ink/35">＋</span>
          <p className="mt-2 text-sm font-bold">Suelta una fila o elemento aquí</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink/45">
            Los elementos sueltos crearán automáticamente una fila de una columna.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {section.rows.map((row) => (
            <EditableRow
              key={row.id}
              row={row}
              sectionId={section.id}
              compact={compact}
              editing={editing}
              pointerPayload={pointerPayload}
              buttonColor={buttonColor}
              border={border}
              buttonFont={buttonFont}
              paragraphFont={paragraphFont}
              headingFont={headingFont}
              onDropItem={onDropItem}
              onUpdateBlock={onUpdateBlock}
              onRemoveBlock={onRemoveBlock}
              onRemoveRow={onRemoveRow}
              clearPointerDrag={clearPointerDrag}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function BuilderPreview({
  headingFont,
  paragraphFont,
  buttonFont,
  buttonStyle,
  border,
  buttonColor,
  logoScale,
  previewMode,
  setPreviewMode,
  sections,
  editing,
  selectedSectionId,
  pointerPayload,
  onAddSection,
  onSelectSection,
  onUpdateSection,
  onRemoveSection,
  onMoveSection,
  onDropItem,
  onUpdateBlock,
  onRemoveBlock,
  onRemoveRow,
  clearPointerDrag,
}: {
  headingFont: string;
  paragraphFont: string;
  buttonFont: string;
  buttonStyle: ButtonStyle;
  border: BorderStyle;
  buttonColor: string;
  logoScale: number;
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  sections: SiteSection[];
  editing: boolean;
  selectedSectionId: string | null;
  pointerPayload: DropPayload | null;
  onAddSection: () => void;
  onSelectSection: (id: string) => void;
  onUpdateSection: (id: string, patch: Partial<SiteSection>) => void;
  onRemoveSection: (id: string) => void;
  onMoveSection: (sourceId: string, targetId: string) => void;
  onRemoveRow: (sectionId: string, rowId: string) => void;
  clearPointerDrag: () => void;
} & BlockMutationProps) {
  const buttonTextColor = buttonStyle === "solid" ? "#111111" : buttonColor;
  const buttonBackground = buttonStyle === "solid" ? buttonColor : "transparent";
  const isDesktop = previewMode === "desktop";

  return (
    <section className="min-h-0 overflow-auto bg-[#f3f4f5] p-4">
      <div className="mx-auto min-w-[680px] max-w-5xl overflow-hidden rounded-md border border-ink/10 bg-white shadow-[0_20px_50px_rgba(17,17,17,0.10)]">
        <div className="grid h-[58px] grid-cols-[1fr_auto_1fr_1fr] items-center border-b border-ink/10 px-5">
          <button type="button" className="justify-self-start text-3xl leading-none text-ink" aria-label="Volver">↖</button>
          <div className="flex items-center justify-self-center rounded-full border border-ink/15 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={`px-6 py-2 ${isDesktop ? "rounded-full bg-ink text-cream" : "text-ink/70"}`}
              aria-pressed={isDesktop}
              aria-label="Vista computadora"
            >
              ▭
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={`px-6 py-2 ${!isDesktop ? "rounded-full bg-ink text-cream" : "text-ink/70"}`}
              aria-pressed={!isDesktop}
              aria-label="Vista celular"
            >
              ▯
            </button>
          </div>
          <span className="justify-self-start text-sm font-semibold text-ink/60">Landing</span>
          <span className="justify-self-center text-sm font-semibold text-green-900">Saved</span>
        </div>

        <div className="flex min-h-[640px] items-start justify-center bg-[#f5f5f5] px-8 py-8">
          <div
            className={`relative overflow-hidden bg-[#23382d] text-white shadow-sm transition-all duration-300 ${
              isDesktop
                ? "h-[600px] w-full overflow-y-auto rounded-md"
                : "h-[620px] w-[430px] overflow-y-auto rounded-[28px_28px_0_0]"
            }`}
          >
            <div className="relative min-h-full">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,39,21,0.08),rgba(7,39,21,0.42)),radial-gradient(circle_at_70%_28%,rgba(255,255,255,0.16),transparent_18%),linear-gradient(16deg,#5f7b7f_0%,#6b8069_28%,#203a2c_51%,#78915c_75%,#2f432d_100%)]" />
              <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_18%_72%,#14351f_0_8%,transparent_9%),radial-gradient(circle_at_28%_68%,#587845_0_7%,transparent_8%),radial-gradient(circle_at_39%_76%,#173a25_0_9%,transparent_10%),radial-gradient(circle_at_58%_69%,#6d8a56_0_8%,transparent_9%),radial-gradient(circle_at_72%_72%,#21492c_0_10%,transparent_11%),radial-gradient(circle_at_86%_66%,#78905c_0_7%,transparent_8%)]" />

              <div className={`relative flex items-start justify-between ${isDesktop ? "px-14 py-12" : "px-10 py-10"}`}>
                <div className="grid grid-cols-3 grid-rows-3 gap-0.5" style={{ height: 44 * logoScale, width: 44 * logoScale }}>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <span key={index} className="rounded-full border border-white/80" />
                  ))}
                </div>
                <button type="button" className="text-3xl font-light" aria-label="Menú">☰</button>
              </div>

              <h1
                className={`relative mx-auto text-center font-semibold leading-none ${
                  isDesktop ? "mt-2 max-w-3xl text-[64px]" : "mt-28 max-w-sm text-[44px]"
                }`}
                style={{ fontFamily: fontFamily(headingFont) }}
              >
                Echological
              </h1>
              <p
                className={`relative mx-auto mt-4 text-center text-white/80 ${isDesktop ? "max-w-md text-base" : "max-w-[280px] text-sm"}`}
                style={{ fontFamily: fontFamily(paragraphFont) }}
              >
                Un espacio para conectar con la naturaleza.
              </p>

              {isDesktop ? (
                <div className="relative mx-auto mt-64 w-[420px] overflow-hidden rounded-md bg-white text-ink shadow-2xl">
                  <div className="grid grid-cols-2 border-b border-ink/10">
                    <div className="p-4"><p className="text-sm text-ink/45">Llegada</p></div>
                    <div className="border-l border-ink/10 p-4"><p className="text-sm text-ink/45">Salida</p></div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div><p className="text-xs text-ink/45">Huéspedes</p><p className="text-sm">1 adulto</p></div>
                    <span>⌄</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`relative mx-auto mt-12 block border px-14 py-3 text-base font-medium ${borderClass(border)}`}
                  style={{
                    backgroundColor: buttonBackground,
                    borderColor: buttonColor,
                    color: buttonTextColor,
                    fontFamily: fontFamily(buttonFont),
                  }}
                >
                  Buscar
                </button>
              )}

              <div className={isDesktop ? "relative mt-16" : "relative mt-20"}>
                {sections.length === 0 && editing ? (
                  <div className="m-3 flex min-h-64 flex-col items-center justify-center rounded-md border-2 border-dashed border-white/45 bg-white/10 px-8 text-center">
                    <button
                      type="button"
                      onClick={onAddSection}
                      className="rounded-md bg-white px-5 py-3 text-sm font-bold text-ink shadow-lg"
                    >
                      + Agregar sección
                    </button>
                    <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/65">
                      Agrega una sección y después arrastra filas, elementos o widgets.
                    </p>
                  </div>
                ) : (
                  sections.map((section) => (
                    <EditableSection
                      key={section.id}
                      section={section}
                      compact={!isDesktop}
                      editing={editing}
                      selected={selectedSectionId === section.id}
                      pointerPayload={pointerPayload}
                      buttonColor={buttonColor}
                      border={border}
                      buttonFont={buttonFont}
                      paragraphFont={paragraphFont}
                      headingFont={headingFont}
                      onSelect={onSelectSection}
                      onUpdateSection={onUpdateSection}
                      onRemoveSection={onRemoveSection}
                      onMoveSection={onMoveSection}
                      onDropItem={onDropItem}
                      onUpdateBlock={onUpdateBlock}
                      onRemoveBlock={onRemoveBlock}
                      onRemoveRow={onRemoveRow}
                      clearPointerDrag={clearPointerDrag}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
