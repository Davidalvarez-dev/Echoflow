"use client";

import { useState } from "react";
import type { WebsiteRental } from "./management-panels";

type ThemeKey = "Echological" | "Sierra" | "Costa" | "Nómada" | "Luz";

const themeOptions: Array<{
  name: ThemeKey;
  description: string;
  palette: string;
  accent: string;
}> = [
  {
    name: "Sierra",
    description: "Naturaleza y alojamientos rurales",
    palette: "from-[#26382d] via-[#66765d] to-[#c4bc8b]",
    accent: "bg-[#26382d]",
  },
  {
    name: "Costa",
    description: "Estancias luminosas cerca del mar",
    palette: "from-[#244c59] via-[#72a3a5] to-[#e6d7b1]",
    accent: "bg-[#244c59]",
  },
  {
    name: "Nómada",
    description: "Glamping y experiencias memorables",
    palette: "from-[#4d3527] via-[#a5744f] to-[#e2c795]",
    accent: "bg-[#4d3527]",
  },
  {
    name: "Luz",
    description: "Minimalista para propiedades urbanas",
    palette: "from-[#d7d4cc] via-[#f2f0e9] to-[#a8b3a5]",
    accent: "bg-[#111111]",
  },
];

function StoreIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v10h16V10" />
      <path d="M3 4h18l-1.3 6H4.3L3 4Z" />
      <path d="M8 10v10M16 10v10M9 20v-5h6v5" />
      <path d="M4.3 10c.5 1.3 2.8 1.3 3.7 0 .9 1.3 3.1 1.3 4 0 .9 1.3 3.1 1.3 4 0 .9 1.3 3.2 1.3 3.7 0" />
    </svg>
  );
}

function PreviewArtwork({
  palette,
  compact = false,
}: {
  palette: string;
  compact?: boolean;
}) {
  return (
    <div className={`overflow-hidden rounded-md border border-ink/10 bg-white ${compact ? "h-52" : "h-full"}`}>
      <div className="flex h-8 items-center gap-3 border-b border-ink/10 px-3 text-[8px] font-bold text-ink">
        <span className="mr-auto">Echological</span>
        <span>Inicio</span>
        <span>Alojamientos</span>
        <span>Contacto</span>
      </div>
      <div className={`relative flex h-[46%] items-end bg-gradient-to-br ${palette} p-4 text-white`}>
        <div>
          <p className={`${compact ? "text-sm" : "text-xl"} font-display font-extrabold leading-tight`}>Escápate a la naturaleza</p>
          <span className="mt-2 inline-flex rounded bg-white px-2 py-1 text-[8px] font-bold text-ink">Reservar</span>
        </div>
      </div>
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[9px] font-bold text-ink">Alojamientos</span>
          <span className="text-[7px] text-ink/45">Ver todos</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => (
            <div key={item}>
              <div className={`aspect-[4/3] rounded-sm bg-gradient-to-br ${palette} ${item === 1 ? "opacity-80" : "opacity-100"}`} />
              <div className="mt-1 h-1.5 w-3/4 rounded-full bg-ink/15" />
              <div className="mt-1 h-1 w-1/2 rounded-full bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CurrentThemePreview({ rentalCount }: { rentalCount: number }) {
  return (
    <div className="relative flex min-h-80 items-end justify-center gap-6 overflow-hidden bg-[#eef0ed] px-8 pt-8">
      <div className="h-[286px] w-[72%] max-w-3xl shadow-[0_18px_45px_rgba(17,17,17,0.15)]">
        <PreviewArtwork palette="from-[#26382d] via-[#66765d] to-[#c4bc8b]" />
      </div>
      <div className="h-[260px] w-36 shrink-0 shadow-[0_18px_45px_rgba(17,17,17,0.15)]">
        <div className="h-full overflow-hidden rounded-t-[18px] border-[5px] border-ink bg-white">
          <div className="flex h-8 items-center justify-between border-b border-ink/10 px-3 text-[7px] font-bold">
            <span>☰</span><span>Echological</span><span>⌕</span>
          </div>
          <div className="flex h-28 items-end bg-gradient-to-br from-[#26382d] via-[#66765d] to-[#c4bc8b] p-3 text-white">
            <p className="font-display text-sm font-extrabold leading-tight">Reserva tu próxima escapada</p>
          </div>
          <div className="p-3">
            <p className="text-[9px] font-bold">{rentalCount} alojamientos</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="aspect-square rounded-sm bg-[#879379]" />
              <div className="aspect-square rounded-sm bg-[#baa87d]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WebsiteOverview({
  rentals,
  onEdit,
}: {
  rentals: WebsiteRental[];
  onEdit: () => void;
}) {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("Echological");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false);

  function generateTheme() {
    if (!prompt.trim()) return;
    setGenerated(true);
    setCurrentTheme("Echological");
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f4f4f2] text-ink">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink/10 bg-[#f4f4f2]/95 px-8 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-[#637c3e]"><StoreIcon /></span>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Sitio web</h1>
            <p className="text-xs text-ink/45">Administra el diseño y la publicación de tu sitio.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-bold hover:border-ink/30">Ver sitio</button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-lg font-bold text-ink/55 hover:bg-white" aria-label="Más acciones">•••</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-7 py-8">
        <section className="overflow-hidden rounded-lg border border-ink/12 bg-white shadow-[0_10px_28px_rgba(17,17,17,0.06)]">
          <CurrentThemePreview rentalCount={rentals.length} />

          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[#dbc98d] bg-[#fff8e8] px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-coral text-ink">✓</span>
              <div>
                <p className="text-sm font-bold">Tu sitio está listo para personalizarse</p>
                <p className="text-xs text-ink/55">Revisa contenido, disponibilidad y tarifas antes de publicarlo.</p>
              </div>
            </div>
            <button type="button" onClick={onEdit} className="rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold hover:border-ink">Revisar contenido</button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">{currentTheme}</h2>
                <span className="rounded bg-[#edf7ea] px-2 py-1 text-[10px] font-bold uppercase text-[#3f7b45]">Tema activo</span>
              </div>
              <p className="mt-1 text-sm text-ink/50">Actualizado hace un momento · {rentals.length} alojamientos conectados</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-md border border-ink/15 text-lg font-bold hover:bg-ink/[0.03]" aria-label="Acciones del tema">•••</button>
              <button type="button" onClick={onEdit} className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-ink/85">Editar sitio</button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-extrabold">Descubre plantillas</h2>
              <p className="mt-1 text-sm text-ink/50">Empieza con una estructura pensada para vender estancias.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-bold">Explorar todas</button>
              <button type="button" className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-bold">Importar</button>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-ink/12 bg-white p-5">
            <label className="block">
              <span className="text-sm font-bold">Genera un sitio personalizado</span>
              <span className="mt-1 block text-sm text-ink/50">Describe tu propiedad para crear una propuesta de diseño y secciones.</span>
              <div className="mt-4 flex gap-2">
                <input
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setGenerated(false);
                  }}
                  placeholder="p. ej., glamping de montaña para parejas y familias"
                  className="h-11 min-w-0 flex-1 rounded-md border border-ink/15 px-4 text-sm outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={generateTheme}
                  disabled={!prompt.trim()}
                  className="rounded-md bg-ink px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-ink/20"
                >
                  Crear propuesta
                </button>
              </div>
            </label>
            {generated && <p role="status" className="mt-3 text-sm font-semibold text-[#3f7b45]">Propuesta creada. Puedes abrirla desde Editar sitio.</p>}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {themeOptions.map((theme) => (
              <article key={theme.name} className="overflow-hidden rounded-lg border border-ink/12 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(17,17,17,0.08)]">
                <div className="p-3 pb-0"><PreviewArtwork palette={theme.palette} compact /></div>
                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="min-w-0">
                    <h3 className="font-bold">{theme.name}</h3>
                    <p className="truncate text-xs text-ink/50">{theme.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentTheme(theme.name)}
                    className="shrink-0 rounded-md border border-ink/15 px-4 py-2 text-xs font-bold hover:border-ink"
                  >
                    Aplicar
                  </button>
                </div>
              </article>
            ))}

            <article className="grid min-h-72 content-center justify-items-start rounded-lg border border-dashed border-ink/20 bg-white p-7">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-coral"><StoreIcon /></span>
              <h3 className="mt-5 font-display text-2xl font-extrabold">Explora más plantillas</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/50">Encuentra diseños para hoteles, glamping, cabañas y rentas vacacionales.</p>
              <button type="button" className="mt-5 rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold">Ver biblioteca</button>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
