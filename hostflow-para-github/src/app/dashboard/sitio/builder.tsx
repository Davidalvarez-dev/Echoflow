"use client";

import { useEffect, useState } from "react";
import {
  BuilderPreview,
  SectionsPanel as VisualSectionsPanel,
  createContentBlock,
  createSiteRow,
  createSiteSection,
  type BlockType,
  type ContentBlock,
  type DropPayload,
  type DropTarget,
  type PresetType,
  type SiteSection as VisualSiteSection,
} from "./visual-editor";
import {
  ExternalWidgetsPanel,
  RentalsPanel,
  WebsiteSettingsPanel,
  type WebsiteRental,
} from "./management-panels";
import { CatalogBuilder } from "./catalog-builder";
import { WebsiteOverview } from "./website-overview";

type BorderStyle = "sharp" | "rounded" | "pill";
type ButtonStyle = "solid" | "outline";
type PanelView = "styles" | "logo";
type PreviewMode = "desktop" | "mobile";
export type BuilderTab = "Editor" | "Styles" | "Pages" | "Settings" | "Rentals" | "External widgets";

const tabs: BuilderTab[] = ["Editor", "Styles", "Pages", "Settings", "Rentals", "External widgets"];
const tabLabels: Record<BuilderTab, string> = {
  Editor: "Editor",
  Styles: "Diseño",
  Pages: "Secciones",
  Settings: "Ajustes",
  Rentals: "Alojamientos",
  "External widgets": "Widgets externos",
};
const fontOptions = ["Questrial", "Raleway", "Inter", "Baloo"];
const colors = ["#ffffff", "#a19d81", "#928c70", "#8a846b", "#c3aa43", "#072715"];

const themes = [
  { name: "Livingstone", selected: true },
  { name: "Tideway" },
  { name: "Capucine" },
  { name: "Brooklyn" },
];

const borderOptions: {
  label: string;
  value: BorderStyle;
  preview: string;
}[] = [
  { label: "Sharp", value: "sharp", preview: "rounded-none" },
  { label: "Rounded", value: "rounded", preview: "rounded-lg" },
  { label: "Pill", value: "pill", preview: "rounded-full" },
];

function ThemeCard({
  name,
  selected = false,
  onClick,
}: {
  name: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-3 rounded-lg border bg-white p-3 text-sm font-semibold text-ink transition hover:border-ink ${
        selected ? "border-ink" : "border-transparent"
      }`}
    >
      <div className="h-[74px] w-[108px] rounded-md border-2 border-ink/75 p-2">
        {name === "Brooklyn" ? (
          <div className="flex h-full gap-2">
            <div className="w-4 border-r border-ink/70" />
            <div className="flex-1" />
          </div>
        ) : name === "Tideway" ? (
          <div className="h-full border-b-2 border-ink/70" />
        ) : name === "Capucine" ? (
          <div className="h-full border-l-2 border-t-2 border-ink/70" />
        ) : (
          <div className="h-full rounded border-2 border-ink/70" />
        )}
      </div>
      <span>{name}</span>
    </button>
  );
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-lg font-medium text-ink">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 h-12 w-full rounded-xl border border-ink/20 bg-white px-4 text-lg text-ink outline-none focus:border-ink"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StylesPanel({
  theme,
  setTheme,
  headingFont,
  setHeadingFont,
  paragraphFont,
  setParagraphFont,
  buttonFont,
  setButtonFont,
  buttonStyle,
  setButtonStyle,
  border,
  setBorder,
  buttonColor,
  setButtonColor,
  openLogo,
}: {
  theme: string;
  setTheme: (value: string) => void;
  headingFont: string;
  setHeadingFont: (value: string) => void;
  paragraphFont: string;
  setParagraphFont: (value: string) => void;
  buttonFont: string;
  setButtonFont: (value: string) => void;
  buttonStyle: ButtonStyle;
  setButtonStyle: (value: ButtonStyle) => void;
  border: BorderStyle;
  setBorder: (value: BorderStyle) => void;
  buttonColor: string;
  setButtonColor: (value: string) => void;
  openLogo: () => void;
}) {
  return (
    <aside className="min-h-0 overflow-y-auto border-r border-ink/10 bg-white px-8 py-5">
      <div className="grid grid-cols-2 gap-x-8 gap-y-8">
        {themes.map((item) => (
          <ThemeCard
            key={item.name}
            name={item.name}
            selected={theme === item.name}
            onClick={() => setTheme(item.name)}
          />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl font-extrabold text-ink">Colors</h2>
        <div className="mt-5 flex items-center justify-between rounded-md border border-ink/15 bg-white px-3 py-2">
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setButtonColor(color)}
                className={`h-7 w-7 rounded-full border ${
                  color === buttonColor ? "border-ink" : "border-ink/10"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Use color ${color}`}
              />
            ))}
          </div>
          <span className="text-lg text-ink/60">⌄</span>
        </div>

        <div className="mt-6 space-y-5">
          {[
            ["Business name", "#ffffff"],
            ["Header background", "#a19d81"],
            ["Header links", "#928c70"],
            ["Buttons and actions", buttonColor],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-ink">{label}</span>
              <span
                className="h-5 w-5 rounded-full border border-ink/10"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-9">
        <h2 className="font-display text-3xl font-extrabold text-ink">Fonts</h2>
        <SelectControl
          label="Heading"
          value={headingFont}
          options={fontOptions}
          onChange={setHeadingFont}
        />
        <SelectControl
          label="Paragraph"
          value={paragraphFont}
          options={fontOptions}
          onChange={setParagraphFont}
        />
        <SelectControl
          label="Buttons"
          value={buttonFont}
          options={fontOptions}
          onChange={setButtonFont}
        />
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl font-extrabold text-ink">Buttons</h2>
        <div className="mt-9">
          <SelectControl
            label="Style"
            value={buttonStyle === "solid" ? "Solid" : "Outline"}
            options={["Solid", "Outline"]}
            onChange={(value) => setButtonStyle(value === "Solid" ? "solid" : "outline")}
          />
        </div>

        <div className="mt-9">
          <p className="text-lg font-bold text-ink">Border</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {borderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBorder(option.value)}
                className={`flex h-28 flex-col items-center justify-center gap-3 border text-lg font-medium text-ink ${
                  border === option.value
                    ? "rounded-lg border-ink"
                    : "border-transparent"
                }`}
              >
                <span className={`h-7 w-16 border-2 border-ink ${option.preview}`} />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 pb-10">
        <h2 className="font-display text-3xl font-extrabold text-ink">
          Other options
        </h2>
        <button
          type="button"
          onClick={openLogo}
          className="mt-10 flex w-full items-center justify-between py-2 text-lg font-bold text-ink"
        >
          Logo <span className="text-3xl">→</span>
        </button>
      </section>
    </aside>
  );
}

function LogoPanel({
  logoScale,
  setLogoScale,
  clearLogo,
  close,
}: {
  logoScale: number;
  setLogoScale: (value: number) => void;
  clearLogo: () => void;
  close: () => void;
}) {
  return (
    <aside className="min-h-0 overflow-y-auto border-r border-ink/10 bg-white px-10 py-10">
      <button
        type="button"
        onClick={close}
        className="flex items-center gap-3 text-xl text-ink"
      >
        <span className="text-3xl">←</span> Back
      </button>

      <section className="mt-12">
        <h2 className="font-display text-4xl font-extrabold text-ink">Logo</h2>
        <h3 className="mt-10 font-display text-xl font-extrabold text-ink">
          Logo image
        </h3>
        <p className="mt-5 max-w-sm text-lg leading-relaxed text-ink/80">
          Use any of the following supported formats: JPG, JPEG, PNG, GIF.
          Ideal aspect ratios are 2:1 or 1:1 (square image). Size should be
          400px x 192px (min. height 60px).
        </p>

        <div className="mt-10 flex h-64 items-start justify-end rounded-2xl border border-ink/10 bg-white p-6 shadow-[0_12px_30px_rgba(17,17,17,0.08)]">
          <button
            type="button"
            onClick={clearLogo}
            className="text-2xl text-ink"
            aria-label="Remove logo"
          >
            ♲
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between text-xl text-ink">
          <span>Resize logo</span>
          <span>{logoScale.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.6"
          max="1.4"
          step="0.02"
          value={logoScale}
          onChange={(event) => setLogoScale(Number(event.target.value))}
          className="mt-8 w-full accent-ink"
        />
      </section>
    </aside>
  );
}

export function WebsiteBuilder({
  rentals,
  initialTab = "Editor",
}: {
  rentals: WebsiteRental[];
  initialTab?: BuilderTab;
}) {
  const [activePanel, setActivePanel] = useState<PanelView>("styles");
  const [theme, setTheme] = useState("Livingstone");
  const [headingFont, setHeadingFont] = useState("Questrial");
  const [paragraphFont, setParagraphFont] = useState("Raleway");
  const [buttonFont, setButtonFont] = useState("Raleway");
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>("solid");
  const [border, setBorder] = useState<BorderStyle>("pill");
  const [buttonColor, setButtonColor] = useState("#a19d81");
  const [logoScale, setLogoScale] = useState(0.96);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile");
  const [activeTab, setActiveTab] = useState<BuilderTab>(initialTab);
  const [editorView, setEditorView] = useState<"overview" | "catalog">("overview");
  const [sections, setSections] = useState<VisualSiteSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [pointerPayload, setPointerPayload] = useState<DropPayload | null>(null);

  useEffect(() => {
    if (!pointerPayload) return;

    const clearPointerDrag = () => setPointerPayload(null);
    window.addEventListener("pointerup", clearPointerDrag);
    window.addEventListener("pointercancel", clearPointerDrag);
    return () => {
      window.removeEventListener("pointerup", clearPointerDrag);
      window.removeEventListener("pointercancel", clearPointerDrag);
    };
  }, [pointerPayload]);

  function placeRow(
    section: VisualSiteSection,
    row: ReturnType<typeof createSiteRow>,
    beforeRowId?: string
  ) {
    const rows = [...section.rows];
    const targetIndex = beforeRowId
      ? rows.findIndex((item) => item.id === beforeRowId)
      : -1;
    rows.splice(targetIndex >= 0 ? targetIndex : rows.length, 0, row);
    return { ...section, rows };
  }

  function placeBlock(
    section: VisualSiteSection,
    block: ContentBlock,
    target: DropTarget
  ) {
    if (!target.rowId) {
      return placeRow(section, createSiteRow(1, [block]), target.beforeRowId);
    }

    return {
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== target.rowId) return row;
        const targetColumnId = target.columnId ?? row.columns[0]?.id;
        return {
          ...row,
          columns: row.columns.map((column) => {
            if (column.id !== targetColumnId) return column;
            const blocks = [...column.blocks];
            const targetIndex = target.beforeBlockId
              ? blocks.findIndex((item) => item.id === target.beforeBlockId)
              : -1;
            blocks.splice(targetIndex >= 0 ? targetIndex : blocks.length, 0, block);
            return { ...column, blocks };
          }),
        };
      }),
    };
  }

  function addSection() {
    const section = createSiteSection();
    setSections((current) => [...current, section]);
    setSelectedSectionId(section.id);
  }

  function addBlock(type: BlockType, sectionId?: string) {
    const block = createContentBlock(type);
    const row = createSiteRow(1, [block]);

    if (!sectionId) {
      const section = createSiteSection(row);
      setSections((current) => [...current, section]);
      setSelectedSectionId(section.id);
      return;
    }

    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, rows: [...section.rows, row] }
          : section
      )
    );
    setSelectedSectionId(sectionId);
  }

  function addRow(columns: number, sectionId?: string) {
    const row = createSiteRow(columns);
    if (!sectionId) {
      const section = createSiteSection(row);
      setSections((current) => [...current, section]);
      setSelectedSectionId(section.id);
      return;
    }

    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, rows: [...section.rows, row] }
          : section
      )
    );
    setSelectedSectionId(sectionId);
  }

  function addPreset(preset: PresetType) {
    const section = createSiteSection();
    if (preset === "hero") {
      section.title = "Hero";
      section.rows = [
        createSiteRow(1, [createContentBlock("headline")]),
        createSiteRow(1, [createContentBlock("text")]),
        createSiteRow(1, [createContentBlock("button")]),
      ];
    } else if (preset === "booking") {
      section.title = "Reservas";
      section.rows = [createSiteRow(1, [createContentBlock("booking")])];
    } else {
      section.title = "Contacto";
      const row = createSiteRow(2);
      row.columns[0].blocks = [createContentBlock("text")];
      row.columns[1].blocks = [createContentBlock("form")];
      section.rows = [row];
    }

    setSections((current) => [...current, section]);
    setSelectedSectionId(section.id);
  }

  function updateSection(id: string, patch: Partial<VisualSiteSection>) {
    setSections((current) =>
      current.map((section) => (section.id === id ? { ...section, ...patch } : section))
    );
  }

  function removeSection(id: string) {
    setSections((current) => current.filter((section) => section.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  }

  function moveSection(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    setSections((current) => {
      const sourceIndex = current.findIndex((section) => section.id === sourceId);
      const targetIndex = current.findIndex((section) => section.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [moving] = next.splice(sourceIndex, 1);
      const insertionIndex = next.findIndex((section) => section.id === targetId);
      next.splice(insertionIndex, 0, moving);
      return next;
    });
  }

  function dropItem(payload: DropPayload, target: DropTarget) {
    setSelectedSectionId(target.sectionId);

    if (payload.kind === "new-row") {
      const row = createSiteRow(payload.columns);
      setSections((current) =>
        current.map((section) =>
          section.id === target.sectionId
            ? placeRow(section, row, target.beforeRowId)
            : section
        )
      );
      return;
    }

    if (payload.kind === "new-block") {
      const block = createContentBlock(payload.blockType);
      setSections((current) =>
        current.map((section) =>
          section.id === target.sectionId
            ? placeBlock(section, block, target)
            : section
        )
      );
      return;
    }

    if (payload.kind === "row") {
      if (
        payload.sourceSectionId === target.sectionId &&
        payload.rowId === target.beforeRowId
      ) {
        return;
      }

      setSections((current) => {
        let movingRow: ReturnType<typeof createSiteRow> | undefined;
        const stripped = current.map((section) => {
          if (section.id !== payload.sourceSectionId) return section;
          movingRow = section.rows.find((row) => row.id === payload.rowId);
          return {
            ...section,
            rows: section.rows.filter((row) => row.id !== payload.rowId),
          };
        });
        if (!movingRow) return current;
        return stripped.map((section) =>
          section.id === target.sectionId
            ? placeRow(section, movingRow as ReturnType<typeof createSiteRow>, target.beforeRowId)
            : section
        );
      });
      return;
    }

    if (
      payload.sourceSectionId === target.sectionId &&
      payload.sourceRowId === target.rowId &&
      payload.sourceColumnId === target.columnId &&
      payload.blockId === target.beforeBlockId
    ) {
      return;
    }

    setSections((current) => {
      let movingBlock: ContentBlock | undefined;
      const stripped = current.map((section) => {
        if (section.id !== payload.sourceSectionId) return section;
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id !== payload.sourceRowId) return row;
            return {
              ...row,
              columns: row.columns.map((column) => {
                if (column.id !== payload.sourceColumnId) return column;
                movingBlock = column.blocks.find((block) => block.id === payload.blockId);
                return {
                  ...column,
                  blocks: column.blocks.filter((block) => block.id !== payload.blockId),
                };
              }),
            };
          }),
        };
      });
      if (!movingBlock) return current;
      return stripped.map((section) =>
        section.id === target.sectionId
          ? placeBlock(section, movingBlock as ContentBlock, target)
          : section
      );
    });
  }

  function updateBlock(
    sectionId: string,
    rowId: string,
    columnId: string,
    blockId: string,
    patch: Partial<ContentBlock>
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.map((row) =>
                row.id === rowId
                  ? {
                      ...row,
                      columns: row.columns.map((column) =>
                        column.id === columnId
                          ? {
                              ...column,
                              blocks: column.blocks.map((block) =>
                                block.id === blockId ? { ...block, ...patch } : block
                              ),
                            }
                          : column
                      ),
                    }
                  : row
              ),
            }
          : section
      )
    );
  }

  function removeBlock(
    sectionId: string,
    rowId: string,
    columnId: string,
    blockId: string
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.map((row) =>
                row.id === rowId
                  ? {
                      ...row,
                      columns: row.columns.map((column) =>
                        column.id === columnId
                          ? {
                              ...column,
                              blocks: column.blocks.filter((block) => block.id !== blockId),
                            }
                          : column
                      ),
                    }
                  : row
              ),
            }
          : section
      )
    );
  }

  function removeRow(sectionId: string, rowId: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, rows: section.rows.filter((row) => row.id !== rowId) }
          : section
      )
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {!(activeTab === "Editor" && editorView === "catalog") && <header className="shrink-0 border-b border-ink/10 bg-white">
        <div className="flex h-[54px] items-center justify-between px-5">
          <nav className="flex h-full items-center gap-7 text-sm font-semibold text-ink/60">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== "Styles") setActivePanel("styles");
                }}
                className={`flex h-full items-center border-b-2 ${
                  tab === activeTab
                    ? "border-ink text-ink"
                    : "border-transparent hover:text-ink"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-5 text-sm font-semibold text-ink">
            {(activeTab === "Editor" || activeTab === "Styles" || activeTab === "Pages") && (
              <span className="text-green-900">Guardado</span>
            )}
            <button type="button" className="flex items-center gap-1">
              Ver sitio <span className="text-lg leading-none">⌄</span>
            </button>
            <button
              type="button"
              className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream"
            >
              Publicar sitio
            </button>
          </div>
        </div>
      </header>}

      {activeTab === "Editor" ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          {editorView === "overview" ? (
            <WebsiteOverview rentals={rentals} onEdit={() => setEditorView("catalog")} />
          ) : (
            <CatalogBuilder rentals={rentals} onBack={() => setEditorView("overview")} />
          )}
        </div>
      ) : activeTab === "Settings" ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <WebsiteSettingsPanel />
        </div>
      ) : activeTab === "Rentals" ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <RentalsPanel rentals={rentals} />
        </div>
      ) : activeTab === "External widgets" ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <ExternalWidgetsPanel />
        </div>
      ) : (
        <div className="relative grid min-h-0 flex-1 grid-cols-[360px_minmax(560px,1fr)] overflow-x-auto overflow-y-hidden">
          {activeTab === "Styles" && activePanel === "styles" ? (
            <StylesPanel
              theme={theme}
              setTheme={setTheme}
              headingFont={headingFont}
              setHeadingFont={setHeadingFont}
              paragraphFont={paragraphFont}
              setParagraphFont={setParagraphFont}
              buttonFont={buttonFont}
              setButtonFont={setButtonFont}
              buttonStyle={buttonStyle}
              setButtonStyle={setButtonStyle}
              border={border}
              setBorder={setBorder}
              buttonColor={buttonColor}
              setButtonColor={setButtonColor}
              openLogo={() => setActivePanel("logo")}
            />
          ) : activeTab === "Styles" ? (
            <LogoPanel
              logoScale={logoScale}
              setLogoScale={setLogoScale}
              clearLogo={() => setLogoScale(0.96)}
              close={() => setActivePanel("styles")}
            />
          ) : (
            <VisualSectionsPanel
              sections={sections}
              selectedSectionId={selectedSectionId}
              pointerPayload={pointerPayload}
              addSection={addSection}
              addBlock={addBlock}
              addRow={addRow}
              addPreset={addPreset}
              beginPointerDrag={setPointerPayload}
              clearPointerDrag={() => setPointerPayload(null)}
              selectSection={setSelectedSectionId}
              removeSection={removeSection}
              moveSection={moveSection}
            />
          )}
          <BuilderPreview
            headingFont={headingFont}
            paragraphFont={paragraphFont}
            buttonFont={buttonFont}
            buttonStyle={buttonStyle}
            border={border}
            buttonColor={buttonColor}
            logoScale={logoScale}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            sections={sections}
            editing={activeTab === "Pages"}
            selectedSectionId={selectedSectionId}
            pointerPayload={pointerPayload}
            onAddSection={addSection}
            onSelectSection={setSelectedSectionId}
            onUpdateSection={updateSection}
            onRemoveSection={removeSection}
            onMoveSection={moveSection}
            onDropItem={dropItem}
            onUpdateBlock={updateBlock}
            onRemoveBlock={removeBlock}
            onRemoveRow={removeRow}
            clearPointerDrag={() => setPointerPayload(null)}
          />
        </div>
      )}
    </main>
  );
}
