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
import { site } from "@/config/site";

function getDirectPath() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/u, "");
  const pathname = window.location.pathname.replace(/\/$/u, "") || "/";
  return basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
}

function PageEffects() {
  const { pathname, search, key } = useLocation();
  const { locale, t } = useLocale();
  const reduced = usePrefersReducedMotion();
  const directPath = getDirectPath();
  const contact =
    pathname === "/contacto" ||
    (pathname === "/" && directPath === "/contacto");
  const notFound =
    (pathname !== "/" && pathname !== "/contacto") ||
    (pathname === "/" &&
      directPath !== "/" &&
      directPath !== "/index.html" &&
      directPath !== "/contacto");

  useEffect(() => {
    const title = t(
      notFound
        ? "ITER — Página no encontrada"
        : contact
          ? "ITER — Contacto"
          : "ITER Colombia | Software a medida y automatización"
    );
    const description = t(
      notFound
        ? "La dirección que buscas cambió o ya no está disponible. Volvamos a encontrar el camino."
        : contact
          ? "Cuéntanos qué está pasando. En ITER empezamos por entenderlo."
          : "Diseñamos software a medida, productos digitales y automatización de procesos para resolver problemas reales en Colombia."
    );
    const canonicalPath = notFound ? "/" : contact ? "/contacto" : "/";
    const canonicalUrl = new URL(
      canonicalPath,
      site.url || window.location.origin
    ).href;

    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", canonicalUrl);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", canonicalUrl);
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute(
        "content",
        { es: "es_CO", en: "en_US", fr: "fr_FR" }[locale]
      );
  }, [contact, locale, notFound, pathname, t]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const section =
        pathname === "/" && !notFound ? getHomeSection(search) : undefined;
      const target = section ? document.getElementById(section) : null;
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView({
          behavior: reduced ? "instant" : "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, search, key, reduced, notFound]);

  return null;
}

export default function SiteLayout() {
  const { pathname } = useLocation();
  const { t } = useLocale();
  const directPath = getDirectPath();
  const isDirectHome = directPath === "/" || directPath === "/index.html";
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
      {pathname === "/" && isDirectHome && <ScrollHud />}
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <PrivacyOverlay />
    </>
  );
}
