import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./language-provider";
import { RoleProvider } from "./role-provider";

const baloo = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "800"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hostflow — Gestiona tus alojamientos sin fricción",
  description:
    "Hostflow centraliza calendarios, reservas directas y comunicación con huéspedes en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${baloo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <RoleProvider>{children}</RoleProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
