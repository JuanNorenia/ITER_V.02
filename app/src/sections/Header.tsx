import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/config/site";

/**
 * Header fijo con blend difference: el texto es blanco y se invierte
 * automáticamente sobre las secciones negras. Sin estados de color manuales.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex h-16 items-center justify-between px-5 text-white sm:px-8">
          <a
            href="#top"
            className="font-display text-xl font-black tracking-tight"
            aria-label={`${site.name} — volver arriba`}
          >
            ITER
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="link-line mono-label text-white"
              >
                <span className="mr-1 opacity-50">{item.index}</span>
                {item.label}
              </a>
            ))}
            <a
              href="#contacto"
              data-magnetic
              className="mono-label border border-white px-4 py-2.5 text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              Hablemos ↗
            </a>
          </nav>

          <button
            ref={burgerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
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
      </header>

      {/* Menú móvil: pantalla completa, tipográfico */}
      <div
        id="menu-movil"
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-black px-5 pb-10 pt-28 text-white transition-[clip-path] duration-500 ease-iter md:hidden ${
          open ? "[clip-path:inset(0_0_0%_0)]" : "[clip-path:inset(0_0_100%_0)]"
        }`}
        aria-hidden={!open}
      >
        <nav className="flex flex-col gap-2" aria-label="Menú móvil">
          {nav.map((item, i) => (
            <a
              key={item.href}
              ref={i === 0 ? firstLinkRef : undefined}
              href={item.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="display-section flex items-baseline gap-4 border-b border-white/15 py-4 text-white"
            >
              <span className="mono-label opacity-50">{item.index}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#contacto"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          className="mono-label border border-white px-6 py-4 text-center text-white"
        >
          Hablemos ↗
        </a>
      </div>
    </>
  );
}
