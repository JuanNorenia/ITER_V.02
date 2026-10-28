import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLocale } from "@/providers/LocaleProvider";

const FOUR = ["#...#", "#...#", "#...#", "#####", "....#", "....#", "....#"];
const ZERO = [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."];
const GLYPHS = [FOUR, ZERO, FOUR];
const WIDTH = 17;

function render404(scan: number, isStatic: boolean): string {
  return Array.from({ length: 7 }, (_, row) => {
    const shape = GLYPHS.map(glyph => glyph[row]).join(".");
    return Array.from(shape, (cell, column) => {
      if (cell !== "#") return " ";
      if (isStatic) return "#";
      const distance = Math.abs(column - scan);
      if (distance === 0) return "█";
      if (distance === 1) return "▓";
      if (distance <= 3) return "%";
      return "#";
    }).join("");
  }).join("\n");
}

export default function NotFoundAscii({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(
      () => setPhase(current => (current + 1) % (WIDTH + 12)),
      110
    );
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const scan = phase < WIDTH ? phase : -12;

  return (
    <figure
      className={`flex min-w-0 flex-col border border-ink bg-paper ${className}`}
      aria-label={t("Estudio tipográfico ASCII: los caracteres 404 se forman con un barrido de luz.")}
    >
      <figcaption className="mono-label flex items-center justify-between gap-3 border-b border-ink px-3 py-2">
        <span>{t("ITER — Señal perdida")}</span>
        <span className="text-red">{t("ERROR 404")}</span>
      </figcaption>

      <div className="flex min-h-[250px] flex-1 items-center justify-center overflow-hidden px-3 py-8 sm:min-h-[300px]">
        <pre
          aria-hidden="true"
          className="m-0 select-none whitespace-pre font-mono text-[clamp(1.25rem,2.6vw,3rem)] leading-[1.18] tracking-[0.08em] text-red"
        >
          {render404(scan, reducedMotion)}
        </pre>
      </div>

      <div className="mono-label flex items-center justify-between border-t border-ink px-3 py-2">
        <span>{t("RUTA / NO ENCONTRADA")}</span>
        <span aria-hidden="true">
          {reducedMotion ? "404 / HOLD" : "SCAN / 404"}
          {!reducedMotion && <span className="blink">_</span>}
        </span>
      </div>
    </figure>
  );
}
