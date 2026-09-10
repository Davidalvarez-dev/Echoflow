"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: sin auth real todavía — placeholder hasta conectar login de verdad.
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-cream lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col px-8 py-10 sm:px-16 sm:py-12">
        <span className="font-display text-2xl font-bold tracking-tight text-ink">
          hostflow
        </span>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-center text-4xl font-bold text-ink">
              Iniciar sesión
            </h1>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-cream py-3 text-sm font-semibold text-ink transition hover:border-ink/30"
              >
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.6 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.9-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13.5 24 13.5c3.1 0 5.8 1.1 8 3l6-6C34.5 7 29.6 5 24 5c-7.4 0-13.7 4.1-17 9.7z"/>
                  <path fill="#4CAF50" d="M24 44.5c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5c-2 1.4-4.6 2.3-7.6 2.3-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9.6 39.9 16.2 44.5 24 44.5z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3 5.4-5.7 6.9l6.5 5.5C39.9 37.4 44.5 31.5 44.5 24c0-1.2-.1-2.4-.9-3.5z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-cream py-3 text-sm font-semibold text-ink transition hover:border-ink/30"
              >
                <svg width="14" height="16" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27-32.1 24.5-61.2 23.7-71.8-23.8 1.4-51.3 16.4-67 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 68.9-35z"/>
                </svg>
                Apple
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-ink/40">
              <span className="h-px flex-1 bg-ink/10" />
              o con tu email
              <span className="h-px flex-1 bg-ink/10" />
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-ink"
                >
                  Email <span className="text-coral">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 text-sm text-ink outline-none transition focus:border-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-ink"
                >
                  Contraseña <span className="text-coral">*</span>
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full rounded-xl border border-ink/15 bg-cream px-4 py-3 pr-11 text-sm text-ink outline-none transition focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-ink/40 hover:text-ink"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <a
                  href="#"
                  className="mt-2 inline-block text-sm font-semibold text-ink underline decoration-coral decoration-2 underline-offset-2"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink/30 accent-coral"
                />
                Mantener sesión iniciada
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-cream transition hover:bg-black"
              >
                Iniciar sesión
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-ink/60">
              ¿Todavía no usas hostflow?{" "}
              <a href="#" className="font-semibold text-ink underline decoration-coral decoration-2 underline-offset-2">
                Empieza tu prueba gratis
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right: image panel */}
      <div className="hidden p-4 lg:block">
        <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_30%_20%,#f5e030_0%,transparent_45%),linear-gradient(135deg,#1a1a1a_0%,#111111_60%)]">
          <div className="absolute inset-0 flex items-end p-10">
            <p className="font-display max-w-xs text-3xl font-bold leading-tight text-cream">
              Menos hojas de cálculo, más control de tus alojamientos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
