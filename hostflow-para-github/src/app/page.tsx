const nav = [
  { label: "Producto", href: "#producto" },
  { label: "Por qué hostflow", href: "#por-que" },
  { label: "Precios", href: "#precios" },
  { label: "Recursos", href: "#recursos" },
];

const socialProof = ["Casa Marea", "Refugio Alto", "Grupo Litoral", "Nómada Stays", "Los Cedros"];

const featurePills = [
  "Aumenta tus reservas",
  "Reduce comisiones",
  "Simplifica tareas",
  "Protege tus alojamientos",
];

const syncBullets = [
  "Anúnciate en Booking.com, Airbnb y Google al mismo tiempo",
  "Un calendario único para todos tus canales",
  "Precios dinámicos según demanda",
  "Reservas directas sin comisión",
];

const supportCards = [
  {
    title: "Migración asistida",
    body: "Importamos tus propiedades, calendarios y reservas activas desde tu sistema actual sin que se te caiga una reserva.",
  },
  {
    title: "Onboarding guiado",
    body: "Una sesión 1:1 con tu propiedad ya cargada y conectada a tus canales antes de terminar la llamada.",
  },
  {
    title: "Soporte humano",
    body: "Un equipo real responde en menos de una hora hábil, no un bot leyendo un script.",
  },
  {
    title: "Recursos y plantillas",
    body: "Guías de precios, mensajes automáticos y checklists de limpieza listos para adaptar a tu operación.",
  },
];

const stats = [
  { value: "30+", label: "países con propiedades activas en hostflow" },
  { value: "35H", label: "ahorradas al mes en gestión manual" },
  { value: "0%", label: "de comisión en reservas directas" },
  { value: "24/7", label: "sincronización de calendarios entre canales" },
];

const testimonials = [
  {
    quote:
      "Dejé de perseguir hojas de cálculo. Todas mis reservas de Airbnb, Booking y mi propia web caen en un solo calendario.",
    name: "Renata Solís",
    context: "6 propiedades, Oaxaca",
  },
  {
    quote:
      "La migración fue el problema que más miedo me daba y terminó siendo lo más fácil de todo el proceso.",
    name: "Diego Farías",
    context: "Gestor de 14 alojamientos",
  },
  {
    quote:
      "El soporte contesta rápido y entiende de renta vacacional, no solo de software.",
    name: "Camila Rueda",
    context: "Casa Marea, Tulum",
  },
];

const faqs = [
  {
    q: "¿Qué es hostflow?",
    a: "Un software para gestionar alquileres vacacionales: reservas, calendarios sincronizados entre canales, comunicación con huéspedes y tu propia web de reservas directas, todo en un solo lugar.",
  },
  {
    q: "¿Para quién es hostflow?",
    a: "Para anfitriones y gestores con una propiedad o con una cartera en crecimiento que quieren dejar de coordinar todo a mano entre plataformas distintas.",
  },
  {
    q: "¿Se conecta con Airbnb, Booking.com y Vrbo?",
    a: "Sí. El channel manager sincroniza calendarios, precios y disponibilidad automáticamente entre tus canales para evitar dobles reservas.",
  },
  {
    q: "¿Puedo recibir reservas directas?",
    a: "Sí, con tu propia página de reservas sin comisión por reserva, para que tus huéspedes recurrentes no pasen por terceros.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. La configuración inicial se hace acompañado de nuestro equipo y las plantillas están listas para usarse sin tocar código.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col bg-cream text-ink">
      {/* Promo banner */}
      <div className="flex items-center justify-center gap-2 bg-coral px-4 py-2 text-center text-sm font-semibold text-ink">
        <span>Beta abierta: primeros 3 meses gratis con el código LAUNCH</span>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl font-bold tracking-tight">
            hostflow
          </span>
          <nav className="hidden items-center gap-1 rounded-full bg-ink px-2 py-2 text-sm font-medium text-cream md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 transition hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden text-sm font-medium hover:text-ink/70 sm:inline"
            >
              Iniciar sesión
            </a>
            <a
              href="#demo"
              className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-teal sm:inline"
            >
              Agendar llamada
            </a>
            <a
              href="#prueba"
              className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-105"
            >
              Pruébalo gratis
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-black text-cream">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,224,48,0.12),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-1.5 text-sm">
            <span className="text-coral">★★★★★</span>
            <span>4.9/5 · +800 propiedades gestionadas</span>
          </div>
          <p className="font-display text-lg font-semibold uppercase tracking-widest text-cream">
            Menos hojas de cálculo
          </p>
          <h1 className="font-display max-w-4xl text-7xl font-extrabold uppercase leading-[0.9] tracking-tight text-coral sm:text-[8.5rem]">
            Más
            <br />
            reservas
          </h1>
          <p className="max-w-xl text-lg text-cream/70">
            Hostflow centraliza calendarios, reservas directas y comunicación
            con huéspedes para que gestiones tus alojamientos desde un solo
            lugar.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#prueba"
              className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              Pruébalo gratis
            </a>
            <a
              href="#demo"
              className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold transition hover:border-cream"
            >
              Agendar demo
            </a>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-b border-ink/10 bg-cream py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-ink/50">
            Anfitriones y gestores que ya operan con hostflow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-ink/40">
            {socialProof.map((brand) => (
              <span key={brand} className="font-display text-lg font-medium">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature pills + heading */}
      <section id="producto" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 flex flex-wrap gap-2">
          {featurePills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-medium"
            >
              {pill}
            </span>
          ))}
        </div>
        <h2 className="font-display max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Alquiler vacacional sin quebraderos de cabeza, gestiones una
          propiedad o cien.
        </h2>
      </section>

      {/* Calendar sync block */}
      <section className="border-y border-ink/10 bg-ink text-cream">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-display text-3xl font-bold sm:text-4xl">
              Todas tus reservas en un solo calendario
            </h3>
            <p className="mt-4 text-cream/70">
              Sincroniza automáticamente calendarios, precios y disponibilidad
              en tus canales principales y evita dobles reservas.
            </p>
            <ul className="mt-8 space-y-4">
              {syncBullets.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-teal to-ink ring-1 ring-cream/10" />
        </div>
      </section>

      {/* Support cards */}
      <section id="por-que" className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-coral">
          Más que un software
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-tight">
          Un equipo a tu lado, no un panel abandonado
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {supportCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-ink/10 bg-white/60 p-6"
            >
              <h3 className="font-display text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-teal text-cream">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-20 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-4xl font-bold text-coral">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-cream/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="font-display max-w-xl text-4xl font-bold leading-tight">
          Lo que dicen los anfitriones que ya usan hostflow
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-ink/10 bg-white/60 p-6"
            >
              <span className="text-coral">★★★★★</span>
              <blockquote className="mt-3 text-sm leading-relaxed text-ink/80">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {t.name}
                <span className="block font-normal text-ink/50">
                  {t.context}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="recursos" className="border-t border-ink/10 bg-white/40">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-coral">
            ¿Tienes dudas?
          </p>
          <h2 className="font-display mt-3 text-4xl font-bold">Preguntas frecuentes</h2>
          <div className="mt-10 divide-y divide-ink/10">
            {faqs.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {item.q}
                  <span className="text-coral transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-ink/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="precios" className="bg-ink text-cream">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            Prueba hostflow 7 días gratis
          </h2>
          <p className="max-w-md text-cream/70">
            Sin tarjeta de crédito. Conecta tu primera propiedad y compruébalo
            antes de elegir un plan.
          </p>
          <a
            id="prueba"
            href="#"
            className="rounded-full bg-coral px-8 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            Empezar prueba gratis
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-cream py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-ink/50 sm:flex-row">
          <span className="font-display font-bold text-ink">hostflow</span>
          <span>© {new Date().getFullYear()} hostflow. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
