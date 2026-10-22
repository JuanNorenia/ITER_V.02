import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import Cursor from "@/components/Cursor";
import PrivacyOverlay from "@/components/PrivacyOverlay";
import ScrollHud from "@/components/ScrollHud";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { getHomeSection } from "@/lib/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLocale } from "@/providers/LocaleProvider";

function PageEffects() {
  const { pathname, search, key } = useLocation();
  const { locale, t } = useLocale();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const contact = pathname === "/contacto";
    const title = t(
      contact ? "ITER — Contacto" : "ITER — Encontramos mejores formas de resolver problemas",
    );
    const description = t(
      contact
        ? "Cuéntanos qué está pasando. En ITER empezamos por entenderlo."
        : "Diseñamos y construimos soluciones digitales para resolver problemas reales.",
    );
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute(
      "content",
      { es: "es_CO", en: "en_US", fr: "fr_FR" }[locale],
    );
  }, [locale, pathname, t]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const section = pathname === "/" ? getHomeSection(search) : undefined;
      const target = section ? document.getElementById(section) : null;
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, search, key, reduced]);

  return null;
}

export default function SiteLayout() {
  const { pathname } = useLocation();
  const { t } = useLocale();
  return (
    <>
      <PageEffects />
      <Link
        to="#main-content"
        onClick={event => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
        className="skip-link"
      >
        {t("Ir al contenido")}
      </Link>
      <Cursor />
      {pathname === "/" && <ScrollHud />}
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <PrivacyOverlay />
    </>
  );
}
