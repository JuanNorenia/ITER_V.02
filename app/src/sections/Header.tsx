import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { nav, site } from "@/config/site";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { contactPath, homeSectionPath } from "@/lib/navigation";
import { useLocale } from "@/providers/LocaleProvider";

/**
 * Header fijo con blend difference: el texto es blanco y se invierte
 * automáticamente sobre las secciones negras. Sin estados de color manuales.
 */
export default function Header() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    if (open) firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        burgerRef.current?.focus();
      }
      if (e.key === "Tab" && open) {
        const controls = Array.from(document.querySelectorAll<HTMLElement>(
          "header a, header button, #menu-movil a",
        )).filter(el => el.getClientRects().length && !el.closest("[inert]"));
        const first = controls[0];
        const last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex h-16 items-center justify-between px-5 text-white sm:px-8">
          <Link
            to={homeSectionPath("top")}
            className="font-display text-xl font-black tracking-tight"
            aria-label={t(`${site.name} — volver arriba`)}
          >
            {site.name}
          </Link>

          <div className="flex min-w-0 items-center gap-1 sm:gap-3 xl:gap-6">
          <nav className="hidden items-center gap-5 xl:flex" aria-label={t("Principal")}>
            {nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="link-line mono-label whitespace-nowrap text-white"
              >
                <span className="mr-1 opacity-50">{item.index}</span>
                {t(item.label)}
              </Link>
            ))}
            <Link
              to={contactPath()}
              data-magnetic
              className="mono-label whitespace-nowrap border border-white px-4 py-2.5 text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              {t("Hablemos ↗")}
            </Link>
          </nav>

          <LanguageSwitcher />

          <button
            ref={burgerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={t(open ? "Cerrar menú" : "Abrir menú")}
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 xl:hidden"
          >
            <span
              className={`h-px w-6 bg-white transition-transform duration-300 ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-white transition-transform duration-300 ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
          </div>
        </div>
      </header>

      {/* Menú móvil: pantalla completa, tipográfico */}
      <div
        id="menu-movil"
        className={`fixed inset-0 z-40 flex flex-col justify-between gap-8 overflow-y-auto bg-black px-5 pb-10 pt-28 text-white transition-[clip-path] duration-500 ease-iter xl:hidden ${
          open ? "[clip-path:inset(0_0_0%_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav className="flex flex-col gap-2" aria-label={t("Menú móvil")}>
          {nav.map((item, i) => (
            <Link
              key={item.href}
              ref={i === 0 ? firstLinkRef : undefined}
              to={item.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="display-section flex items-baseline gap-4 border-b border-white/15 py-4 text-white"
            >
              <span className="mono-label shrink-0 opacity-50">{item.index}</span>
              <span className="min-w-0">{t(item.label)}</span>
            </Link>
          ))}
        </nav>
        <Link
          to={contactPath()}
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          className="mono-label border border-white px-6 py-4 text-center text-white"
        >
          {t("Hablemos ↗")}
        </Link>
      </div>
    </>
  );
}
