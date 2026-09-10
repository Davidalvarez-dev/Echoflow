"use client";

import { useState } from "react";

export type ThemeSettings = {
  storeName: string;
  logoDataUrl: string;
  faviconDataUrl: string;
  pageBackground: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  borderColor: string;
  bodyFont: string;
  headingFont: string;
  baseFontSize: number;
  h1Size: number;
  h2Size: number;
  headingLineHeight: "tight" | "normal" | "loose";
  letterSpacing: "normal" | "wide";
  uppercaseHeadings: boolean;
  pageWidth: "narrow" | "standard" | "wide";
  pageTransition: boolean;
  productTransition: boolean;
  addToCartAnimation: boolean;
  hoverEffect: "none" | "lift" | "zoom";
  badgePosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  badgeRadius: number;
  badgeBg: string;
  badgeText: string;
  primaryButtonBg: string;
  primaryButtonText: string;
  primaryButtonBorder: string;
  primaryButtonBorderWidth: number;
  primaryButtonRadius: number;
  secondaryButtonBg: string;
  secondaryButtonText: string;
  secondaryButtonBorder: string;
  secondaryButtonBorderWidth: number;
  secondaryButtonRadius: number;
  uppercaseButtons: boolean;
  cartType: "page" | "drawer";
  cartNotes: boolean;
  cartDiscounts: boolean;
  cartInstallments: boolean;
  acceleratedCheckout: boolean;
  drawerBg: string;
  drawerText: string;
  drawerBorder: string;
  drawerRadius: number;
  drawerBorderWidth: number;
  drawerShadow: boolean;
  iconStroke: "thin" | "default" | "bold";
  inputBg: string;
  inputText: string;
  inputBorder: string;
  inputBorderWidth: number;
  inputRadius: number;
  popoverBg: string;
  popoverText: string;
  popoverBorder: string;
  popoverRadius: number;
  popoverBorderWidth: number;
  popoverShadow: boolean;
  showCurrencyProduct: boolean;
  showCurrencyCards: boolean;
  showCurrencyCart: boolean;
  showCurrencyTotal: boolean;
  quickAdd: boolean;
  quickAddMobile: boolean;
  secondImageOnHover: boolean;
  productCarousel: boolean;
  cardBg: string;
  cardText: string;
  cardRadius: number;
  searchProductRadius: number;
  searchCardRadius: number;
  uppercaseProductTitles: boolean;
  swatchVariantImages: boolean;
  swatchWidth: number;
  swatchHeight: number;
  swatchRadius: number;
  swatchBorderWidth: number;
  swatchBorderOpacity: number;
  variantBg: string;
  variantText: string;
  variantBorder: string;
  selectedVariantBg: string;
  selectedVariantText: string;
  selectedVariantBorder: string;
  variantButtonBorderWidth: number;
  variantButtonRadius: number;
  variantButtonWidth: "fit" | "fill";
  customCss: string;
};

export const defaultThemeSettings: ThemeSettings = {
  storeName: "Echological",
  logoDataUrl: "",
  faviconDataUrl: "",
  pageBackground: "#fdfcf8",
  surfaceColor: "#ffffff",
  textColor: "#111111",
  mutedColor: "#6f6d66",
  primaryColor: "#f5e030",
  borderColor: "#d9d7cf",
  bodyFont: "Inter, sans-serif",
  headingFont: "Inter, sans-serif",
  baseFontSize: 14,
  h1Size: 56,
  h2Size: 36,
  headingLineHeight: "tight",
  letterSpacing: "normal",
  uppercaseHeadings: false,
  pageWidth: "standard",
  pageTransition: false,
  productTransition: true,
  addToCartAnimation: true,
  hoverEffect: "lift",
  badgePosition: "top-right",
  badgeRadius: 20,
  badgeBg: "#f5e030",
  badgeText: "#111111",
  primaryButtonBg: "#111111",
  primaryButtonText: "#ffffff",
  primaryButtonBorder: "#111111",
  primaryButtonBorderWidth: 0,
  primaryButtonRadius: 6,
  secondaryButtonBg: "#ffffff",
  secondaryButtonText: "#111111",
  secondaryButtonBorder: "#111111",
  secondaryButtonBorderWidth: 1,
  secondaryButtonRadius: 6,
  uppercaseButtons: false,
  cartType: "drawer",
  cartNotes: false,
  cartDiscounts: true,
  cartInstallments: false,
  acceleratedCheckout: true,
  drawerBg: "#ffffff",
  drawerText: "#111111",
  drawerBorder: "#d9d7cf",
  drawerRadius: 0,
  drawerBorderWidth: 1,
  drawerShadow: true,
  iconStroke: "default",
  inputBg: "#ffffff",
  inputText: "#111111",
  inputBorder: "#d9d7cf",
  inputBorderWidth: 1,
  inputRadius: 6,
  popoverBg: "#ffffff",
  popoverText: "#111111",
  popoverBorder: "#d9d7cf",
  popoverRadius: 8,
  popoverBorderWidth: 1,
  popoverShadow: true,
  showCurrencyProduct: false,
  showCurrencyCards: false,
  showCurrencyCart: false,
  showCurrencyTotal: true,
  quickAdd: true,
  quickAddMobile: true,
  secondImageOnHover: true,
  productCarousel: false,
  cardBg: "#ffffff",
  cardText: "#111111",
  cardRadius: 0,
  searchProductRadius: 0,
  searchCardRadius: 6,
  uppercaseProductTitles: false,
  swatchVariantImages: false,
  swatchWidth: 34,
  swatchHeight: 34,
  swatchRadius: 17,
  swatchBorderWidth: 1,
  swatchBorderOpacity: 20,
  variantBg: "#ffffff",
  variantText: "#111111",
  variantBorder: "#d9d7cf",
  selectedVariantBg: "#111111",
  selectedVariantText: "#ffffff",
  selectedVariantBorder: "#111111",
  variantButtonBorderWidth: 1,
  variantButtonRadius: 6,
  variantButtonWidth: "fit",
  customCss: "",
};

type ThemeKey = keyof ThemeSettings;

function ToggleControl({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (checked: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 py-2.5">
      <span className="min-w-0 text-sm font-medium text-ink">{label}{hint && <span className="mt-1 block text-xs font-normal leading-relaxed text-ink/45">{hint}</span>}</span>
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <span className="block h-6 w-11 rounded-full bg-ink/20 transition peer-checked:bg-ink" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function SelectControl({ label, value, options, onChange }: { label: string; value: string; options: Array<{ label: string; value: string }>; onChange: (value: string) => void }) {
  return <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3 py-2 text-sm font-medium"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 min-w-0 rounded-md border border-ink/20 bg-white px-3 outline-none focus:border-ink">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3 py-2 text-sm font-medium">
      <span>{label}</span>
      <span className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-ink/20 bg-white px-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0" />
        <input value={value.toUpperCase()} onChange={(event) => /^#[0-9a-fA-F]{0,6}$/.test(event.target.value) && onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-semibold uppercase outline-none" aria-label={`${label}, valor hexadecimal`} />
      </span>
    </label>
  );
}

function RangeControl({ label, value, min, max, unit = "px", onChange }: { label: string; value: number; min: number; max: number; unit?: string; onChange: (value: number) => void }) {
  return (
    <label className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3 py-2 text-sm font-medium">
      <span>{label}</span>
      <span className="grid min-w-0 grid-cols-[minmax(0,1fr)_68px] items-center gap-2">
        <input type="range" value={value} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 accent-ink" />
        <span className="flex h-9 items-center justify-between rounded-md border border-ink/20 bg-white px-2 text-xs"><strong>{value}</strong><span className="text-ink/45">{unit}</span></span>
      </span>
    </label>
  );
}

function SegmentedControl({ label, value, options, onChange }: { label: string; value: string; options: Array<{ label: string; value: string }>; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-[108px_minmax(0,1fr)] items-center gap-3 py-2 text-sm font-medium">
      <span>{label}</span>
      <div className="grid grid-flow-col auto-cols-fr rounded-md bg-ink/[0.06] p-1">{options.map((option) => <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`rounded px-2 py-2 text-xs font-bold transition ${value === option.value ? "bg-white shadow-sm" : "text-ink/50 hover:text-ink"}`}>{option.label}</button>)}</div>
    </div>
  );
}

function MediaControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  function loadFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }
  return (
    <div className="py-3">
      <p className="mb-2 text-sm font-bold">{label}</p>
      <label className="flex min-h-24 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-ink/25 bg-ink/[0.02] p-3 text-center hover:bg-ink/[0.04]">
        <input type="file" accept="image/*" className="sr-only" onChange={(event) => loadFile(event.target.files?.[0])} />
        {value ? <span role="img" aria-label={label} className="block h-16 w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${value})` }} /> : <span><strong className="block text-sm">Seleccionar imagen</strong><span className="mt-1 block text-xs text-ink/45">PNG, JPG o SVG</span></span>}
      </label>
      {value && <button type="button" onClick={() => onChange("")} className="mt-2 text-xs font-bold text-ink/55 underline">Quitar imagen</button>}
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="border-b border-ink/10">
      <button type="button" onClick={onToggle} className="flex min-h-14 w-full items-center justify-between px-4 text-left text-base font-extrabold hover:bg-ink/[0.025]">
        {title}<span className={`text-ink/40 transition ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open && <div className="border-t border-ink/[0.06] px-4 pb-5 pt-3">{children}</div>}
    </section>
  );
}

const fontOptions = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "System UI", value: "system-ui, sans-serif" },
];

export function ThemeSettingsPanel({ value, onChange }: { value: ThemeSettings; onChange: (value: ThemeSettings) => void }) {
  const [open, setOpen] = useState("palette");
  const update = <K extends ThemeKey>(key: K, nextValue: ThemeSettings[K]) => onChange({ ...value, [key]: nextValue });
  const toggle = (key: string) => setOpen((current) => current === key ? "" : key);
  const accordions: Array<{ id: string; title: string; content: React.ReactNode }> = [
    { id: "identity", title: "Logo y favicon", content: <><label className="block py-2 text-sm font-bold">Nombre del sitio<input value={value.storeName} onChange={(event) => update("storeName", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-ink/20 px-3 font-normal outline-none focus:border-ink" /></label><MediaControl label="Logo principal" value={value.logoDataUrl} onChange={(next) => update("logoDataUrl", next)} /><MediaControl label="Favicon" value={value.faviconDataUrl} onChange={(next) => update("faviconDataUrl", next)} /></> },
    { id: "palette", title: "Paleta de colores", content: <><ColorControl label="Fondo" value={value.pageBackground} onChange={(next) => update("pageBackground", next)} /><ColorControl label="Superficie" value={value.surfaceColor} onChange={(next) => update("surfaceColor", next)} /><ColorControl label="Texto" value={value.textColor} onChange={(next) => update("textColor", next)} /><ColorControl label="Texto suave" value={value.mutedColor} onChange={(next) => update("mutedColor", next)} /><ColorControl label="Acento" value={value.primaryColor} onChange={(next) => update("primaryColor", next)} /><ColorControl label="Bordes" value={value.borderColor} onChange={(next) => update("borderColor", next)} /></> },
    { id: "typography", title: "Tipografía", content: <><SelectControl label="Cuerpo" value={value.bodyFont} options={fontOptions} onChange={(next) => update("bodyFont", next)} /><SelectControl label="Encabezados" value={value.headingFont} options={fontOptions} onChange={(next) => update("headingFont", next)} /><RangeControl label="Texto base" value={value.baseFontSize} min={12} max={20} onChange={(next) => update("baseFontSize", next)} /><RangeControl label="Encabezado 1" value={value.h1Size} min={32} max={88} onChange={(next) => update("h1Size", next)} /><RangeControl label="Encabezado 2" value={value.h2Size} min={24} max={64} onChange={(next) => update("h2Size", next)} /><SelectControl label="Interlineado" value={value.headingLineHeight} options={[{ label: "Ajustado", value: "tight" }, { label: "Normal", value: "normal" }, { label: "Holgado", value: "loose" }]} onChange={(next) => update("headingLineHeight", next as ThemeSettings["headingLineHeight"])} /><SelectControl label="Espaciado" value={value.letterSpacing} options={[{ label: "Normal", value: "normal" }, { label: "Amplio", value: "wide" }]} onChange={(next) => update("letterSpacing", next as ThemeSettings["letterSpacing"])} /><ToggleControl label="Encabezados en mayúsculas" checked={value.uppercaseHeadings} onChange={(next) => update("uppercaseHeadings", next)} /></> },
    { id: "page", title: "Página", content: <><ColorControl label="Fondo" value={value.pageBackground} onChange={(next) => update("pageBackground", next)} /><SegmentedControl label="Ancho" value={value.pageWidth} options={[{ label: "Estrecho", value: "narrow" }, { label: "Normal", value: "standard" }, { label: "Amplio", value: "wide" }]} onChange={(next) => update("pageWidth", next as ThemeSettings["pageWidth"])} /></> },
    { id: "animations", title: "Animaciones", content: <><ToggleControl label="Transición de página" checked={value.pageTransition} onChange={(next) => update("pageTransition", next)} /><ToggleControl label="Transición a detalle" checked={value.productTransition} onChange={(next) => update("productTransition", next)} /><ToggleControl label="Animar al agregar" checked={value.addToCartAnimation} onChange={(next) => update("addToCartAnimation", next)} /><SelectControl label="Al pasar cursor" value={value.hoverEffect} options={[{ label: "Ninguno", value: "none" }, { label: "Elevar", value: "lift" }, { label: "Acercar imagen", value: "zoom" }]} onChange={(next) => update("hoverEffect", next as ThemeSettings["hoverEffect"])} /></> },
    { id: "badges", title: "Insignias", content: <><SelectControl label="Posición" value={value.badgePosition} options={[{ label: "Arriba derecha", value: "top-right" }, { label: "Arriba izquierda", value: "top-left" }, { label: "Abajo derecha", value: "bottom-right" }, { label: "Abajo izquierda", value: "bottom-left" }]} onChange={(next) => update("badgePosition", next as ThemeSettings["badgePosition"])} /><RangeControl label="Radio" value={value.badgeRadius} min={0} max={50} onChange={(next) => update("badgeRadius", next)} /><ColorControl label="Fondo" value={value.badgeBg} onChange={(next) => update("badgeBg", next)} /><ColorControl label="Texto" value={value.badgeText} onChange={(next) => update("badgeText", next)} /></> },
    { id: "buttons", title: "Botones", content: <><p className="pb-1 pt-2 text-sm font-extrabold">Botón principal</p><ColorControl label="Fondo" value={value.primaryButtonBg} onChange={(next) => update("primaryButtonBg", next)} /><ColorControl label="Texto" value={value.primaryButtonText} onChange={(next) => update("primaryButtonText", next)} /><ColorControl label="Borde" value={value.primaryButtonBorder} onChange={(next) => update("primaryButtonBorder", next)} /><RangeControl label="Grosor" value={value.primaryButtonBorderWidth} min={0} max={5} onChange={(next) => update("primaryButtonBorderWidth", next)} /><RangeControl label="Radio" value={value.primaryButtonRadius} min={0} max={40} onChange={(next) => update("primaryButtonRadius", next)} /><div className="my-3 border-t border-ink/10" /><p className="pb-1 text-sm font-extrabold">Botón secundario</p><ColorControl label="Fondo" value={value.secondaryButtonBg} onChange={(next) => update("secondaryButtonBg", next)} /><ColorControl label="Texto" value={value.secondaryButtonText} onChange={(next) => update("secondaryButtonText", next)} /><ColorControl label="Borde" value={value.secondaryButtonBorder} onChange={(next) => update("secondaryButtonBorder", next)} /><RangeControl label="Grosor" value={value.secondaryButtonBorderWidth} min={0} max={5} onChange={(next) => update("secondaryButtonBorderWidth", next)} /><RangeControl label="Radio" value={value.secondaryButtonRadius} min={0} max={40} onChange={(next) => update("secondaryButtonRadius", next)} /><ToggleControl label="Texto en mayúsculas" checked={value.uppercaseButtons} onChange={(next) => update("uppercaseButtons", next)} /></> },
    { id: "cart", title: "Carrito", content: <><SegmentedControl label="Tipo" value={value.cartType} options={[{ label: "Página", value: "page" }, { label: "Cajón", value: "drawer" }]} onChange={(next) => update("cartType", next as ThemeSettings["cartType"])} /><ToggleControl label="Nota para el anfitrión" checked={value.cartNotes} onChange={(next) => update("cartNotes", next)} /><ToggleControl label="Descuentos" checked={value.cartDiscounts} onChange={(next) => update("cartDiscounts", next)} /><ToggleControl label="Cuotas" checked={value.cartInstallments} onChange={(next) => update("cartInstallments", next)} /><ToggleControl label="Pago acelerado" checked={value.acceleratedCheckout} onChange={(next) => update("acceleratedCheckout", next)} hint="Reduce pasos entre la selección y el pago." /></> },
    { id: "drawers", title: "Cajones", content: <><ColorControl label="Fondo" value={value.drawerBg} onChange={(next) => update("drawerBg", next)} /><ColorControl label="Texto" value={value.drawerText} onChange={(next) => update("drawerText", next)} /><ColorControl label="Borde" value={value.drawerBorder} onChange={(next) => update("drawerBorder", next)} /><RangeControl label="Grosor" value={value.drawerBorderWidth} min={0} max={5} onChange={(next) => update("drawerBorderWidth", next)} /><RangeControl label="Radio" value={value.drawerRadius} min={0} max={32} onChange={(next) => update("drawerRadius", next)} /><ToggleControl label="Sombra" checked={value.drawerShadow} onChange={(next) => update("drawerShadow", next)} /></> },
    { id: "icons", title: "Íconos", content: <SelectControl label="Trazo" value={value.iconStroke} options={[{ label: "Fino", value: "thin" }, { label: "Predeterminado", value: "default" }, { label: "Grueso", value: "bold" }]} onChange={(next) => update("iconStroke", next as ThemeSettings["iconStroke"])} /> },
    { id: "inputs", title: "Campos de entrada", content: <><ColorControl label="Fondo" value={value.inputBg} onChange={(next) => update("inputBg", next)} /><ColorControl label="Texto" value={value.inputText} onChange={(next) => update("inputText", next)} /><ColorControl label="Borde" value={value.inputBorder} onChange={(next) => update("inputBorder", next)} /><RangeControl label="Grosor" value={value.inputBorderWidth} min={0} max={5} onChange={(next) => update("inputBorderWidth", next)} /><RangeControl label="Radio" value={value.inputRadius} min={0} max={32} onChange={(next) => update("inputRadius", next)} /></> },
    { id: "popovers", title: "Popovers y modales", content: <><ColorControl label="Fondo" value={value.popoverBg} onChange={(next) => update("popoverBg", next)} /><ColorControl label="Texto" value={value.popoverText} onChange={(next) => update("popoverText", next)} /><ColorControl label="Borde" value={value.popoverBorder} onChange={(next) => update("popoverBorder", next)} /><RangeControl label="Grosor" value={value.popoverBorderWidth} min={0} max={5} onChange={(next) => update("popoverBorderWidth", next)} /><RangeControl label="Radio" value={value.popoverRadius} min={0} max={32} onChange={(next) => update("popoverRadius", next)} /><ToggleControl label="Sombra" checked={value.popoverShadow} onChange={(next) => update("popoverShadow", next)} /></> },
    { id: "prices", title: "Precios", content: <><p className="pb-2 text-sm font-extrabold">Código de moneda</p><ToggleControl label="Página de alojamiento" checked={value.showCurrencyProduct} onChange={(next) => update("showCurrencyProduct", next)} /><ToggleControl label="Tarjetas" checked={value.showCurrencyCards} onChange={(next) => update("showCurrencyCards", next)} /><ToggleControl label="Artículos del carrito" checked={value.showCurrencyCart} onChange={(next) => update("showCurrencyCart", next)} /><ToggleControl label="Total del carrito" checked={value.showCurrencyTotal} onChange={(next) => update("showCurrencyTotal", next)} /></> },
    { id: "cards", title: "Tarjetas de alojamiento", content: <><ToggleControl label="Reserva rápida" checked={value.quickAdd} onChange={(next) => update("quickAdd", next)} /><ToggleControl label="Reserva rápida en móvil" checked={value.quickAddMobile} onChange={(next) => update("quickAddMobile", next)} /><ToggleControl label="Segunda imagen al pasar" checked={value.secondImageOnHover} onChange={(next) => update("secondImageOnHover", next)} /><ToggleControl label="Mostrar carrusel" checked={value.productCarousel} onChange={(next) => update("productCarousel", next)} /><ColorControl label="Fondo" value={value.cardBg} onChange={(next) => update("cardBg", next)} /><ColorControl label="Texto" value={value.cardText} onChange={(next) => update("cardText", next)} /><RangeControl label="Radio" value={value.cardRadius} min={0} max={32} onChange={(next) => update("cardRadius", next)} /></> },
    { id: "search", title: "Búsqueda", content: <><RangeControl label="Radio imagen" value={value.searchProductRadius} min={0} max={32} onChange={(next) => update("searchProductRadius", next)} /><RangeControl label="Radio tarjeta" value={value.searchCardRadius} min={0} max={32} onChange={(next) => update("searchCardRadius", next)} /><ToggleControl label="Títulos en mayúsculas" checked={value.uppercaseProductTitles} onChange={(next) => update("uppercaseProductTitles", next)} /></> },
    { id: "swatches", title: "Muestrario", content: <><ToggleControl label="Imágenes de variante" checked={value.swatchVariantImages} onChange={(next) => update("swatchVariantImages", next)} /><RangeControl label="Ancho" value={value.swatchWidth} min={20} max={60} onChange={(next) => update("swatchWidth", next)} /><RangeControl label="Altura" value={value.swatchHeight} min={20} max={60} onChange={(next) => update("swatchHeight", next)} /><RangeControl label="Radio" value={value.swatchRadius} min={0} max={30} onChange={(next) => update("swatchRadius", next)} /><RangeControl label="Borde" value={value.swatchBorderWidth} min={0} max={5} onChange={(next) => update("swatchBorderWidth", next)} /><RangeControl label="Opacidad" value={value.swatchBorderOpacity} min={0} max={100} unit="%" onChange={(next) => update("swatchBorderOpacity", next)} /></> },
    { id: "variants", title: "Selectores de variantes", content: <><p className="pb-1 pt-2 text-sm font-extrabold">Configuración normal</p><ColorControl label="Fondo" value={value.variantBg} onChange={(next) => update("variantBg", next)} /><ColorControl label="Texto" value={value.variantText} onChange={(next) => update("variantText", next)} /><ColorControl label="Borde" value={value.variantBorder} onChange={(next) => update("variantBorder", next)} /><p className="pb-1 pt-4 text-sm font-extrabold">Variante seleccionada</p><ColorControl label="Fondo" value={value.selectedVariantBg} onChange={(next) => update("selectedVariantBg", next)} /><ColorControl label="Texto" value={value.selectedVariantText} onChange={(next) => update("selectedVariantText", next)} /><ColorControl label="Borde" value={value.selectedVariantBorder} onChange={(next) => update("selectedVariantBorder", next)} /><RangeControl label="Grosor" value={value.variantButtonBorderWidth} min={0} max={5} onChange={(next) => update("variantButtonBorderWidth", next)} /><RangeControl label="Radio" value={value.variantButtonRadius} min={0} max={32} onChange={(next) => update("variantButtonRadius", next)} /><SegmentedControl label="Ancho" value={value.variantButtonWidth} options={[{ label: "Ajustar", value: "fit" }, { label: "Rellenar", value: "fill" }]} onChange={(next) => update("variantButtonWidth", next as ThemeSettings["variantButtonWidth"])} /></> },
    { id: "css", title: "CSS personalizado", content: <label className="block py-2 text-sm font-bold">CSS<span className="mt-1 block text-xs font-normal leading-relaxed text-ink/45">Usa <code>.hostflow-site-preview</code> para limitar estilos al sitio.</span><textarea value={value.customCss} onChange={(event) => update("customCss", event.target.value)} rows={8} spellCheck={false} placeholder={".hostflow-site-preview .rental-card {\n  border-radius: 12px;\n}"} className="mt-3 w-full resize-y rounded-md border border-ink/20 bg-[#f7f7f5] p-3 font-mono text-xs leading-relaxed outline-none focus:border-ink" /></label> },
  ];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 flex h-14 items-center border-b border-ink/10 bg-white px-4"><h1 className="font-display text-lg font-extrabold">Configuración del tema</h1></div>
      {accordions.map((accordion) => <Accordion key={accordion.id} title={accordion.title} open={open === accordion.id} onToggle={() => toggle(accordion.id)}>{accordion.content}</Accordion>)}
    </div>
  );
}
