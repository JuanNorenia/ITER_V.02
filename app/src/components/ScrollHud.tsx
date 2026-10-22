import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/providers/LocaleProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * HUD DE RECORRIDO
 * Da continuidad al scroll: la página es un solo sistema, no secciones sueltas.
 *  - Línea roja superior: progreso total del recorrido (todos los dispositivos).
 *  - Riel lateral (escritorio): línea vertical continua con relleno rojo y
 *    la sección activa en etiqueta rotada, dentro del margen de la retícula.
 * No interfiere con la interacción (pointer-events: none).
 */

const SECTIONS = [
  { id: "top", index: "00", label: "Inicio" },
  { id: "friccion", index: "01", label: "La fricción" },
  { id: "que-hacemos", index: "02", label: "Qué hacemos" },
  { id: "metodo", index: "03", label: "Método" },
  { id: "principios", index: "04", label: "Cómo pensamos" },
  { id: "para-quien", index: "05", label: "Para quién" },
  { id: "conversacion", index: "06", label: "Conversación" },
  { id: "contacto", index: "07", label: "Contacto" },
] as const;

export default function ScrollHud() {
  const { t } = useLocale();
  const reduced = usePrefersReducedMotion();
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<(typeof SECTIONS)[number]>(
    SECTIONS[0]
  );

  // Progreso total: barra superior + riel lateral
  useEffect(() => {
    if (reduced) {
      if (barRef.current) barRef.current.style.transform = "scaleX(0)";
      if (fillRef.current) fillRef.current.style.transform = "scaleY(0)";
      return;
    }
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${p})`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  // Sección activa
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const found = SECTIONS.find(s => s.id === entry.target.id);
          if (found) setCurrent(found);
        }
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Progreso superior: visible en todo dispositivo */}
      <div
        ref={barRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-red"
        style={{ transform: "scaleX(0)" }}
        aria-hidden="true"
      />

      {/* Riel lateral: la línea del sistema, solo escritorio */}
      <div
        className="pointer-events-none fixed bottom-8 left-[8px] top-20 z-40 hidden w-px lg:block"
        aria-hidden="true"
      >
        <div className="absolute inset-0 w-px bg-black/15" />
        <div
          ref={fillRef}
          className="absolute inset-0 w-px origin-top bg-red"
          style={{ transform: "scaleY(0)" }}
        />
      </div>

      {/* Etiqueta de sección activa: rotada, en el margen, sin solapar */}
      <div
        className="mono-label pointer-events-none fixed left-[16px] top-1/2 z-40 hidden -translate-y-1/2 mix-blend-difference text-white lg:block"
        aria-hidden="true"
      >
        <span className="tabular-nums [writing-mode:vertical-rl]">
          {current.index} / 07 — {t(current.label)}
        </span>
      </div>
    </>
  );
}
