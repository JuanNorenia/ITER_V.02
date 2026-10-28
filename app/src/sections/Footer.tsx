import { Link } from "react-router";
import { nav, site } from "@/config/site";
import { contactPath } from "@/lib/navigation";
import { useLocale } from "@/providers/LocaleProvider";

/**
 * SECCIÓN 10 — FOOTER
 * Estructura editorial: wordmark gigante, enlaces, línea de cierre.
 */
export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  const openPrivacy = () =>
    window.dispatchEvent(new CustomEvent("iter:privacy"));

  return (
    <footer className="break-words bg-black px-5 pb-10 pt-20 text-white sm:px-8">
      <div className="grid grid-cols-1 gap-12 border-b border-white/15 pb-14 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-6">
          <p
            className="font-display font-black uppercase leading-none tracking-tighter"
            style={{ fontSize: "clamp(4rem, 14vw, 12rem)" }}
            aria-hidden="true"
          >
            ITER
            <span className="text-red">.</span>
          </p>
          <p className="display-sub mt-4">{t(site.tagline)}</p>
        </div>

        <nav
          className="flex min-w-0 flex-col gap-4 lg:col-span-3"
          aria-label={t("Pie de página")}
        >
          <p className="mono-label text-white/50">{t("Índice")}</p>
          {nav.map(item => (
            <Link
              key={item.href}
              to={item.href === "/contacto" ? contactPath() : item.href}
              className="link-line body-text w-fit max-w-full"
            >
              {t(item.label)}
            </Link>
          ))}
          <button
            type="button"
            onClick={openPrivacy}
            className="link-line body-text w-fit max-w-full text-left"
          >
            {t("Privacidad")}
          </button>
        </nav>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-3">
          <p className="mono-label text-white/50">{t("Principio")}</p>
          <p className="body-text max-w-xs text-white/70">{t(site.concept)}</p>
          <p className="mono-data text-white/50">
            {t("Más funciones no significa mejor producto.")}
          </p>
        </div>
      </div>

      <div className="mono-label flex flex-col gap-3 pt-6 text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0">
          {t("Tecnología con propósito. Complejidad innecesaria,")}{" "}
          <span className="text-red">{t("no.")}</span>
        </p>
        <p className="min-w-0">
          © {year} {site.name} — {t(site.country)}
        </p>
      </div>
    </footer>
  );
}
