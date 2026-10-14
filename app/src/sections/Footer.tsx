import { nav, site } from "@/config/site";

/**
 * SECCIÓN 10 — FOOTER
 * Estructura editorial: wordmark gigante, enlaces, línea de cierre.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const openPrivacy = () =>
    window.dispatchEvent(new CustomEvent("iter:privacy"));

  return (
    <footer className="bg-black px-5 pb-10 pt-20 text-white sm:px-8">
      <div className="grid grid-cols-1 gap-12 border-b border-white/15 pb-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p
            className="font-display font-black uppercase leading-none tracking-tighter"
            style={{ fontSize: "clamp(4rem, 14vw, 12rem)" }}
            aria-hidden="true"
          >
            ITER
            <span className="text-red">.</span>
          </p>
          <p className="display-sub mt-4">{site.tagline}</p>
        </div>

        <nav
          className="flex flex-col gap-4 lg:col-span-3"
          aria-label="Pie de página"
        >
          <p className="mono-label text-white/50">Índice</p>
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="link-line body-text w-fit"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={openPrivacy}
            className="link-line body-text w-fit text-left"
          >
            Privacidad
          </button>
        </nav>

        <div className="flex flex-col gap-4 lg:col-span-3">
          <p className="mono-label text-white/50">Principio</p>
          <p className="body-text max-w-xs text-white/70">
            {site.concept}
          </p>
          <p className="mono-data text-white/50">
            Más funciones no significa mejor producto.
          </p>
        </div>
      </div>

      <div className="mono-label flex flex-col gap-3 pt-6 text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Tecnología con propósito. Complejidad innecesaria,{" "}
          <span className="text-red">no.</span>
        </p>
        <p>
          © {year} {site.name} — {site.country}
        </p>
      </div>
    </footer>
  );
}
