"use client";

import { useState, useTransition } from "react";
import { createReservation } from "./actions";

type Property = { id: string; name: string; unit: string | null };

const countries = ["México", "Estados Unidos", "España", "Colombia", "Argentina"];
const languages = ["Español", "English", "Português"];

function Counter({
  label,
  hint,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink/50">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink/60 hover:border-ink"
        >
          –
        </button>
        <span className="w-4 text-center text-sm font-semibold text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink/60 hover:border-ink"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-coral">*</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink";

export function NewReservationModal({
  properties,
  compact = false,
}: {
  properties: Property[];
  compact?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [hasQuote, setHasQuote] = useState(false);
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();

  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [source, setSource] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  function openWizard(withQuote: boolean) {
    setHasQuote(withQuote);
    setMenuOpen(false);
    setWizardOpen(true);
    setStep(1);
  }

  function close() {
    setWizardOpen(false);
    setStep(1);
  }

  function handleSubmit(formData: FormData) {
    formData.set("propertyId", propertyId);
    formData.set("checkIn", checkIn);
    formData.set("checkOut", checkOut);
    formData.set("source", source);
    formData.set("adults", String(adults));
    formData.set("children", String(children));
    formData.set("infants", String(infants));
    formData.set("pets", String(pets));
    formData.set("hasQuote", String(hasQuote));

    startTransition(async () => {
      await createReservation(formData);
      close();
    });
  }

  return (
    <div className="relative">
      {compact ? (
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-lg font-semibold text-cream transition hover:bg-black"
          aria-label="Crear reserva"
        >
          +
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream transition hover:bg-black"
        >
          Crear reserva
        </button>
      )}

      {menuOpen && (
        <div
          className={`absolute z-10 w-64 overflow-hidden rounded-xl border border-ink/10 bg-white shadow-lg ${
            compact ? "right-0 top-full mt-2" : "bottom-full left-0 mb-2 w-full"
          }`}
        >
          <button
            type="button"
            onClick={() => openWizard(true)}
            className="block w-full px-4 py-3 text-left text-sm text-ink hover:bg-ink/5"
          >
            Crear reserva con cotización
          </button>
          <button
            type="button"
            onClick={() => openWizard(false)}
            className="block w-full px-4 py-3 text-left text-sm text-ink hover:bg-ink/5"
          >
            Crear reserva sin cotización
          </button>
        </div>
      )}

      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/30">
          <div className="flex h-full w-full max-w-md flex-col bg-cream shadow-2xl">
            <div className="flex items-start justify-between border-b border-ink/10 p-6">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  Crear reserva
                </h2>
                <p className="mt-1 text-sm text-ink/50">
                  {step === 1
                    ? "Propiedad, fechas y huéspedes."
                    : "Datos de contacto del huésped principal."}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {[1, 2].map((s) => (
                    <span
                      key={s}
                      className={`h-1.5 flex-1 rounded-full ${
                        s <= step ? "bg-ink" : "bg-ink/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-ink/40 hover:text-ink"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form action={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                {step === 1 ? (
                  <>
                    <Field label="Propiedad" required>
                      <select
                        value={propertyId}
                        onChange={(e) => setPropertyId(e.target.value)}
                        required
                        className={inputClass}
                      >
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {p.unit ? ` — ${p.unit}` : ""}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Check-in" required>
                        <input
                          type="date"
                          required
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Check-out" required>
                        <input
                          type="date"
                          required
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <Field label="Fuente">
                      <input
                        list="reservation-sources"
                        placeholder="Instagram, Facebook, WhatsApp..."
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className={inputClass}
                      />
                      <datalist id="reservation-sources">
                        <option value="Instagram" />
                        <option value="Facebook" />
                        <option value="WhatsApp" />
                        <option value="Google" />
                        <option value="Web directa" />
                        <option value="Teléfono" />
                        <option value="Referido" />
                        <option value="Airbnb" />
                        <option value="Booking" />
                        <option value="Vrbo" />
                      </datalist>
                    </Field>

                    <div>
                      <p className="text-sm font-semibold text-ink">Huéspedes</p>
                      <div className="mt-2 divide-y divide-ink/5">
                        <Counter
                          label="Adultos"
                          hint="13 años o más"
                          value={adults}
                          min={1}
                          onChange={setAdults}
                        />
                        <Counter
                          label="Niños"
                          hint="2-12 años"
                          value={children}
                          onChange={setChildren}
                        />
                        <Counter
                          label="Infantes"
                          hint="Menos de 2 años"
                          value={infants}
                          onChange={setInfants}
                        />
                        <Counter
                          label="Mascotas"
                          hint=""
                          value={pets}
                          onChange={setPets}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nombre" required>
                        <input name="firstName" required className={inputClass} />
                      </Field>
                      <Field label="Apellido" required>
                        <input name="lastName" required className={inputClass} />
                      </Field>
                    </div>
                    <Field label="Email">
                      <input name="guestEmail" type="email" className={inputClass} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="País">
                        <select name="country" defaultValue="" className={inputClass}>
                          <option value="" disabled>
                            País
                          </option>
                          {countries.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Idioma">
                        <select name="language" defaultValue="Español" className={inputClass}>
                          {languages.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-[5rem_1fr] gap-3">
                      <Field label="Código">
                        <input name="phoneCode" defaultValue="+52" className={inputClass} />
                      </Field>
                      <Field label="Teléfono">
                        <input name="phoneNumber" className={inputClass} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Canal">
                        <select name="channel" defaultValue="DIRECT" className={inputClass}>
                          <option value="DIRECT">Directo</option>
                          <option value="AIRBNB">Airbnb</option>
                          <option value="BOOKING">Booking</option>
                          <option value="VRBO">Vrbo</option>
                        </select>
                      </Field>
                      <Field label={hasQuote ? "Total (cotización)" : "Total (MXN)"}>
                        <input
                          name="totalAmount"
                          type="number"
                          min={0}
                          step="0.01"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between gap-3 border-t border-ink/10 p-6">
                <button
                  type="button"
                  onClick={step === 1 ? close : () => setStep(1)}
                  className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  {step === 1 ? "Cancelar" : "Atrás"}
                </button>
                {step === 1 ? (
                  <button
                    type="button"
                    disabled={!propertyId || !checkIn || !checkOut}
                    onClick={() => setStep(2)}
                    className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-ink transition hover:brightness-105 disabled:opacity-50"
                  >
                    {pending ? "Creando…" : "Crear reserva"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
