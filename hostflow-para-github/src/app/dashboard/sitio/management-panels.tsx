"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

export type WebsiteRental = {
  id: string;
  name: string;
  unit: string | null;
  nightlyRate: number;
};

type SettingsSection =
  | "Domains"
  | "Available languages"
  | "Contact & Social"
  | "Display preferences"
  | "Advanced";

type Domain = {
  id: string;
  hostname: string;
  primary: boolean;
  status: "Active" | "Verifying";
};

const settingsSections: SettingsSection[] = [
  "Domains",
  "Available languages",
  "Contact & Social",
  "Display preferences",
  "Advanced",
];

const fieldClass =
  "mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm text-ink outline-none transition focus:border-ink";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-8 border-b border-ink/10 py-5 last:border-b-0">
      <span>
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="mt-1 block text-sm text-ink/50">{description}</span>
      </span>
      <span className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="block h-6 w-11 rounded-full bg-ink/15 transition peer-checked:bg-ink" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function DomainsSettings() {
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: "primary-domain",
      hostname: "reservas.echological.mx",
      primary: true,
      status: "Active",
    },
    {
      id: "hostflow-domain",
      hostname: "echological.hostflow.app",
      primary: false,
      status: "Active",
    },
  ]);
  const [domainDraft, setDomainDraft] = useState("");
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = window.localStorage.getItem("hostflow.website.domains");
      if (saved) {
        try {
          setDomains(JSON.parse(saved) as Domain[]);
        } catch {
          window.localStorage.removeItem("hostflow.website.domains");
        }
      }
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem("hostflow.website.domains", JSON.stringify(domains));
  }, [domains, storageReady]);

  function addDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hostname = domainDraft.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!hostname || !hostname.includes(".")) return;
    setDomains((current) => [
      ...current,
      {
        id: `domain-${Date.now()}`,
        hostname,
        primary: current.length === 0,
        status: "Verifying",
      },
    ]);
    setDomainDraft("");
    setShowDomainForm(false);
  }

  function makePrimary(id: string) {
    setDomains((current) =>
      current.map((domain) => ({ ...domain, primary: domain.id === id }))
    );
    setOpenMenuId(null);
  }

  function removeDomain(id: string) {
    setDomains((current) => {
      const removing = current.find((domain) => domain.id === id);
      const next = current.filter((domain) => domain.id !== id);
      if (removing?.primary && next[0]) next[0] = { ...next[0], primary: true };
      return next;
    });
    setOpenMenuId(null);
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-extrabold text-ink">Domains</h1>
          <p className="mt-3 text-base leading-relaxed text-ink/55">
            Add your domains and choose one as the main domain. The rest will redirect traffic to it.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowDomainForm((current) => !current)}
            className="rounded-full bg-[#edf4fa] px-5 py-3 text-sm font-bold text-ink"
          >
            Use a domain you own
          </button>
          <button
            type="button"
            onClick={() => {
              setDomainDraft("echological.hostflow.app");
              setShowDomainForm(true);
            }}
            className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Get a free domain
          </button>
        </div>
      </div>

      {showDomainForm && (
        <form onSubmit={addDomain} className="mt-8 flex max-w-2xl gap-3">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Domain name</span>
            <input
              value={domainDraft}
              onChange={(event) => setDomainDraft(event.target.value)}
              placeholder="reservas.yourdomain.com"
              aria-label="Domain name"
              className="h-11 w-full rounded-md border border-ink/20 px-4 text-sm outline-none focus:border-ink"
              autoFocus
            />
          </label>
          <button type="submit" className="rounded-md bg-ink px-5 text-sm font-bold text-white">
            Connect
          </button>
          <button
            type="button"
            onClick={() => setShowDomainForm(false)}
            className="rounded-md border border-ink/15 px-4 text-sm font-bold text-ink"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="mt-10 overflow-visible rounded-md border border-ink/12 bg-white">
        {domains.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink/45">No domains connected yet.</div>
        ) : (
          domains.map((domain) => (
            <div
              key={domain.id}
              className="relative flex min-h-20 items-center justify-between gap-4 border-b border-ink/10 px-6 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-base font-medium text-ink">{domain.hostname}</span>
                {domain.primary && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#3266db]" title="Main domain" />
                )}
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    domain.status === "Active"
                      ? "bg-[#edf8ed] text-[#3f8c45]"
                      : "bg-[#fff4d8] text-[#8d6410]"
                  }`}
                >
                  {domain.status}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenMenuId((current) => (current === domain.id ? null : domain.id))}
                  className="grid h-9 w-9 place-items-center rounded-md text-xl text-ink/60 hover:bg-ink/5"
                  aria-label={`Domain actions for ${domain.hostname}`}
                  aria-expanded={openMenuId === domain.id}
                >
                  ···
                </button>
              </div>
              {openMenuId === domain.id && (
                <div className="absolute right-5 top-14 z-20 w-44 rounded-md border border-ink/10 bg-white p-1 shadow-xl">
                  {!domain.primary && (
                    <button
                      type="button"
                      onClick={() => makePrimary(domain.id)}
                      className="w-full rounded px-3 py-2 text-left text-sm hover:bg-ink/5"
                    >
                      Set as main
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDomain(domain.id)}
                    className="w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    Remove domain
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function LanguagesSettings() {
  const [languages, setLanguages] = useState(["Spanish"]);
  const options = ["Spanish", "English", "French", "German", "Portuguese"];

  return (
    <section className="max-w-4xl">
      <h1 className="font-display text-4xl font-extrabold text-ink">Available languages</h1>
      <p className="mt-3 text-base text-ink/55">Choose the languages guests can use on your website.</p>
      <div className="mt-9 rounded-md border border-ink/12 px-6">
        {options.map((language) => (
          <label key={language} className="flex cursor-pointer items-center gap-3 border-b border-ink/10 py-5 last:border-b-0">
            <input
              type="checkbox"
              checked={languages.includes(language)}
              onChange={(event) =>
                setLanguages((current) =>
                  event.target.checked
                    ? [...current, language]
                    : current.filter((item) => item !== language)
                )
              }
              className="h-4 w-4 accent-ink"
            />
            <span className="text-sm font-bold text-ink">{language}</span>
            {language === "Spanish" && <span className="ml-auto text-xs text-ink/40">Default</span>}
          </label>
        ))}
      </div>
    </section>
  );
}

function ContactSettings() {
  const [saved, setSaved] = useState(false);

  return (
    <section className="max-w-4xl">
      <h1 className="font-display text-4xl font-extrabold text-ink">Contact &amp; Social</h1>
      <p className="mt-3 text-base text-ink/55">Information guests can use to contact your business.</p>
      <form
        className="mt-9 grid gap-6 rounded-md border border-ink/12 p-7 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <label className="text-sm font-bold text-ink">
          Contact email
          <input defaultValue="reservas@echological.mx" className={fieldClass} type="email" />
        </label>
        <label className="text-sm font-bold text-ink">
          Phone
          <input defaultValue="+52 55 0000 0000" className={fieldClass} type="tel" />
        </label>
        <label className="text-sm font-bold text-ink">
          Instagram
          <input defaultValue="@echological" className={fieldClass} />
        </label>
        <label className="text-sm font-bold text-ink">
          Facebook
          <input defaultValue="Echological" className={fieldClass} />
        </label>
        <div className="flex items-center gap-4 sm:col-span-2">
          <button type="submit" className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-white">
            Save changes
          </button>
          {saved && <span role="status" className="text-sm font-semibold text-green-700">Saved</span>}
        </div>
      </form>
    </section>
  );
}

function DisplaySettings() {
  const [showPrices, setShowPrices] = useState(true);
  const [showAvailability, setShowAvailability] = useState(true);
  const [showTaxes, setShowTaxes] = useState(false);

  return (
    <section className="max-w-4xl">
      <h1 className="font-display text-4xl font-extrabold text-ink">Display preferences</h1>
      <p className="mt-3 text-base text-ink/55">Control what guests see while browsing your website.</p>
      <div className="mt-9 rounded-md border border-ink/12 px-6">
        <ToggleRow label="Show nightly prices" description="Display the base price on rental pages." checked={showPrices} onChange={setShowPrices} />
        <ToggleRow label="Show live availability" description="Let guests see which dates are open." checked={showAvailability} onChange={setShowAvailability} />
        <ToggleRow label="Include taxes in prices" description="Show the final tax-inclusive price first." checked={showTaxes} onChange={setShowTaxes} />
      </div>
    </section>
  );
}

function AdvancedSettings() {
  const [saved, setSaved] = useState(false);

  return (
    <section className="max-w-4xl">
      <h1 className="font-display text-4xl font-extrabold text-ink">Advanced</h1>
      <p className="mt-3 text-base text-ink/55">SEO and tracking settings for your published website.</p>
      <form
        className="mt-9 space-y-6 rounded-md border border-ink/12 p-7"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <label className="block text-sm font-bold text-ink">
          Site title
          <input defaultValue="Echological | Nature stays" className={fieldClass} />
        </label>
        <label className="block text-sm font-bold text-ink">
          Meta description
          <textarea defaultValue="Unique nature stays and direct reservations." className="mt-2 min-h-28 w-full rounded-md border border-ink/15 p-3 text-sm outline-none focus:border-ink" />
        </label>
        <label className="block text-sm font-bold text-ink">
          Analytics ID
          <input placeholder="G-XXXXXXXXXX" className={fieldClass} />
        </label>
        <div className="flex items-center gap-4">
          <button type="submit" className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-white">Save changes</button>
          {saved && <span role="status" className="text-sm font-semibold text-green-700">Saved</span>}
        </div>
      </form>
    </section>
  );
}

export function WebsiteSettingsPanel() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("Domains");

  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-y-auto bg-white lg:grid-cols-[360px_minmax(0,1fr)] lg:overflow-hidden">
      <nav className="border-b border-ink/10 px-6 py-7 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-11">
        <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`shrink-0 rounded-md px-4 py-3 text-left text-sm font-semibold transition lg:w-full ${
                activeSection === section ? "bg-ink/[0.045] text-ink" : "text-ink/75 hover:bg-ink/[0.025]"
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </nav>
      <div className="min-w-0 overflow-y-auto px-7 py-10 sm:px-12 lg:px-16">
        {activeSection === "Domains" && <DomainsSettings />}
        {activeSection === "Available languages" && <LanguagesSettings />}
        {activeSection === "Contact & Social" && <ContactSettings />}
        {activeSection === "Display preferences" && <DisplaySettings />}
        {activeSection === "Advanced" && <AdvancedSettings />}
      </div>
    </div>
  );
}

const thumbnailColors = [
  ["#4f6844", "#b8bf83"],
  ["#607c52", "#d2c28f"],
  ["#315d5a", "#a8c5ae"],
  ["#6a7046", "#c9b57b"],
  ["#4f6444", "#a7aa7e"],
  ["#385e47", "#c1bd8a"],
];

export function RentalsPanel({ rentals }: { rentals: WebsiteRental[] }) {
  const [query, setQuery] = useState("");
  const [assignedIds, setAssignedIds] = useState(() => new Set(rentals.map((rental) => rental.id)));
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = window.localStorage.getItem("hostflow.website.assigned-rentals");
      if (saved) {
        try {
          const savedIds = JSON.parse(saved) as string[];
          const validIds = new Set(rentals.map((rental) => rental.id));
          setAssignedIds(new Set(savedIds.filter((id) => validIds.has(id))));
        } catch {
          window.localStorage.removeItem("hostflow.website.assigned-rentals");
        }
      }
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [rentals]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(
      "hostflow.website.assigned-rentals",
      JSON.stringify(Array.from(assignedIds))
    );
  }, [assignedIds, storageReady]);

  const filteredRentals = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rentals;
    return rentals.filter((rental) =>
      `${rental.name} ${rental.unit ?? ""} ${rental.id}`.toLowerCase().includes(normalized)
    );
  }, [query, rentals]);

  function toggleAssigned(id: string) {
    setAssignedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setOpenMenuId(null);
  }

  return (
    <div className="h-full overflow-y-auto bg-white px-7 py-10 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-4xl font-extrabold text-ink">Rentals</h1>

        <div className="mt-8 flex gap-4 rounded-md bg-[#edf2ff] px-5 py-5 text-ink">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#3f71df] text-xs font-bold text-[#3f71df]">i</span>
          <div>
            <p className="text-sm font-bold">{assignedIds.size} rentals assigned</p>
            <p className="mt-1 text-sm text-ink/65">Only assigned rentals are shown on your published website.</p>
          </div>
        </div>

        <label className="relative mt-7 block">
          <span className="sr-only">Search rentals</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by rental name or rental ID"
            className="h-12 w-full rounded-md border border-ink/20 px-4 pr-12 text-sm outline-none focus:border-ink"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-ink/70">⌕</span>
        </label>

        <div className="mt-7 space-y-3 pb-12">
          {filteredRentals.map((rental, index) => {
            const assigned = assignedIds.has(rental.id);
            const colors = thumbnailColors[index % thumbnailColors.length];
            return (
              <article
                key={rental.id}
                className="relative flex min-h-24 items-center gap-5 rounded-md border border-ink/15 bg-white px-5 py-4"
              >
                <div
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md"
                  style={{ background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})` }}
                  aria-hidden="true"
                >
                  <span className="absolute bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-b-[19px] border-l-[14px] border-r-[14px] border-b-white/90 border-l-transparent border-r-transparent" />
                  <span className="absolute bottom-1 left-1/2 h-2 w-7 -translate-x-1/2 rounded-full bg-ink/20" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-medium text-ink">{rental.name}</h2>
                  <p className="mt-1 text-sm text-ink/50">#{rental.unit ?? rental.id.slice(-6).toUpperCase()}</p>
                </div>
                <span className={`rounded px-2 py-1 text-xs font-bold ${assigned ? "bg-[#edf8ed] text-[#3f8c45]" : "bg-ink/5 text-ink/50"}`}>
                  {assigned ? "Assigned" : "Available"}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenMenuId((current) => (current === rental.id ? null : rental.id))}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-xl text-ink/60 hover:bg-ink/5"
                  aria-label={`Rental actions for ${rental.name}`}
                  aria-expanded={openMenuId === rental.id}
                >
                  ···
                </button>
                {openMenuId === rental.id && (
                  <div className="absolute right-5 top-16 z-20 w-48 rounded-md border border-ink/10 bg-white p-1 shadow-xl">
                    <button
                      type="button"
                      onClick={() => toggleAssigned(rental.id)}
                      className="w-full rounded px-3 py-2 text-left text-sm hover:bg-ink/5"
                    >
                      {assigned ? "Remove from website" : "Assign to website"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          {filteredRentals.length === 0 && (
            <div className="rounded-md border border-dashed border-ink/20 px-6 py-16 text-center">
              <p className="text-sm font-bold text-ink">No rentals found</p>
              <button type="button" onClick={() => setQuery("")} className="mt-3 text-sm underline">Clear search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExternalWidgetsPanel() {
  const [copied, setCopied] = useState<string | null>(null);
  const widgets = [
    {
      id: "booking",
      name: "Reservation calendar",
      description: "Let guests choose dates, guests and availability directly on another website.",
      code: '<iframe src="https://reservas.echological.mx/widget" title="Reservations"></iframe>',
    },
    {
      id: "search",
      name: "Availability search",
      description: "A compact search widget that links guests to your direct booking flow.",
      code: '<script src="https://reservas.echological.mx/search.js"></script>',
    },
  ];

  async function copyWidget(id: string, code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="h-full overflow-y-auto bg-white px-7 py-10 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-4xl font-extrabold text-ink">External widgets</h1>
        <p className="mt-3 max-w-3xl text-base text-ink/55">Add Hostflow reservation tools to an existing website.</p>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {widgets.map((widget) => (
            <article key={widget.id} className="rounded-md border border-ink/15 p-6">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-[#edf2ff] text-xl">▦</div>
              <h2 className="mt-5 text-lg font-bold text-ink">{widget.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-relaxed text-ink/55">{widget.description}</p>
              <button
                type="button"
                onClick={() => copyWidget(widget.id, widget.code)}
                className="mt-6 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white"
              >
                {copied === widget.id ? "Copied" : "Copy embed code"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
