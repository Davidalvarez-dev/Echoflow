"use client";

import { useLanguage } from "../language-provider";

export function ComingSoon({
  title,
  description,
}: {
  title: Record<"es" | "en", string>;
  description: Record<"es" | "en", string>;
}) {
  const { language } = useLanguage();
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center bg-[#f6f7f9] p-10">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-ink/15 bg-white text-xl">🚧</span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">{title[language]}</h1>
        <p className="mt-2 text-sm text-ink/50">{description[language]}</p>
        <p className="mt-4 inline-block rounded-full bg-coral/25 px-3 py-1 text-xs font-bold text-ink">
          {language === "es" ? "En construcción — ya está en el blueprint" : "Under construction — already in the blueprint"}
        </p>
      </div>
    </main>
  );
}
