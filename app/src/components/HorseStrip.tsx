import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLocale } from "@/providers/LocaleProvider";

/**
 * ESTUDIO DE MOVIMIENTO N.º 002 — GALOPE
 *
 * La referencia del caballo, interpretada: no un animal ilustrado, sino
 * el principio que nos inspira de los estudios de locomoción secuencial —
 * el movimiento descompuesto en fotogramas. Un galope es un ciclo que se
 * repite para avanzar: la metáfora exacta de iterar.
 *
 * Seis fotogramas dibujados con caracteres, calculados en tiempo real.
 * Sobre fondo negro actúa como puente visual hacia el CTA final:
 * la página no se corta, cambia de estado. El puntero acelera el galope.
 */

const FRAMES: string[][] = [
  [
    "                   ##",
    "                  ####",
    "                 #######",
    "              ####",
    "            ####",
    "   ############",
    "#################",
    "################",
    "###############",
    "#      #      ##",
    "      ##       #",
    "     ##        #",
    "    ##         #",
  ],
  [
    "                  ####",
    "                 #######",
    "              ####",
    "            ####",
    "   ############",
    "#################",
    "################",
    "###############",
    "#    ###      ###",
    "     #         ##",
    "",
    "",
    "",
  ],
  [
    "                  ####",
    "                 #######",
    "              ####",
    "            ####",
    "   ############",
    "#################",
    "################",
    "###############",
    "#    ###     ##",
    "    ##        ##",
    "    #          ##",
    "    #          ##",
    "               ##",
  ],
  [
    "                   ##",
    "                  ####",
    "                 #######",
    "              ####",
    "            ####",
    "   ############",
    "#################",
    "################",
    "###############",
    "#    ###      #",
    "    ##        #",
    "    #         #",
    "    #         #",
  ],
  [
    "                   ##",
    "                  ####",
    "                 #######",
    "              ####",
    "            ####",
    "   ############",
    "#################",
    "################",
    "###############",
    "#    #        #",
    "     #        #",
    "     #        #",
    "     #        #",
  ],
  [
    "                   ##",
    "                  ####",
    "                 #######",
    "              ####",
    "            ####",
    "   ############",
    "#################",
    "################",
    "###############",
    "#    #        ##",
    "     #         #",
    "     #         #",
    "     #         #",
  ],
];

const HORSE_W = 24;
const HORSE_H = 13;
const TICK = 1000 / 13; // cadencia del galope
const BASE_SPEED = 0.62; // celdas por fotograma

export default function HorseStrip({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const horseRef = useRef<HTMLPreElement>(null);
  const groundRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const horse = horseRef.current;
    const ground = groundRef.current;
    if (!root || !horse || !ground) return;

    let raf = 0;
    let last = 0;
    let running = false;
    let cols = 0;
    let rows = 0;
    let x = -HORSE_W - 2;
    let frame = 0;
    let speed = BASE_SPEED;
    let speedTarget = BASE_SPEED;

    const measure = () => {
      const rect = root.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;
      const firstMeasure = cols === 0;
      const targetCols = rect.width < 640 ? 58 : 118;
      const fontSize = rect.width / (targetCols * 0.6);
      const lineH = fontSize * 1.06;
      cols = targetCols;
      rows = Math.max(HORSE_H + 3, Math.floor(rect.height / lineH));
      for (const pre of [horse, ground]) {
        pre.style.fontSize = `${fontSize}px`;
        pre.style.lineHeight = `${lineH}px`;
      }
      // El caballo entra en escena ya visible, no desde fuera del campo
      if (firstMeasure) x = Math.round(cols * 0.18);
      paintGround();
    };

    const paintGround = () => {
      if (!cols || !rows) return;
      const lines: string[] = [];
      for (let j = 0; j < rows; j++) {
        if (j === rows - 1) {
          // Línea de suelo: punteada, constante
          lines.push("·".repeat(cols));
        } else if (j % 3 === 1) {
          // Textura mínima: la retícula del sistema siempre presente
          let line = "";
          for (let i = 0; i < cols; i++) {
            line += (i * 7 + j * 13) % 29 === 0 ? "·" : " ";
          }
          lines.push(line);
        } else {
          lines.push("");
        }
      }
      ground.textContent = lines.join("\n");
    };

    const paint = () => {
      if (!cols || !rows) return;
      const sprite = FRAMES[frame];
      const top = rows - 1 - HORSE_H;
      const left = Math.round(x);
      const lines: string[] = [];
      for (let j = 0; j < rows; j++) {
        const sj = j - top;
        if (sj < 0 || sj >= HORSE_H) {
          lines.push("");
          continue;
        }
        const src = sprite[sj];
        if (left >= cols || left + src.length <= 0) {
          lines.push("");
          continue;
        }
        const start = Math.max(0, left);
        const end = Math.min(cols, left + src.length);
        lines.push(
          " ".repeat(start) + src.slice(start - left, end - left),
        );
      }
      horse.textContent = lines.join("\n");
      if (frameRef.current) {
        frameRef.current.textContent = `F${String(frame + 1).padStart(2, "0")}/06`;
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      if (now - last < TICK) return;
      last = now;
      speed += (speedTarget - speed) * 0.08;
      x += speed;
      // Pausa entre cruces: quietud y movimiento alternados, no desfile
      if (x > cols + 2) x = -HORSE_W - 2 - Math.random() * 45;
      frame = (frame + 1) % FRAMES.length;
      paint();
    };

    const onEnter = () => {
      speedTarget = BASE_SPEED * 1.9;
    };
    const onLeave = () => {
      speedTarget = BASE_SPEED;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    io.observe(root);

    if (reduced) {
      // Alternativa estática: el fotograma de suspensión, a mitad del recorrido
      x = 8;
      frame = 2;
      paint();
    } else {
      running = true;
      raf = requestAnimationFrame(loop);
      root.addEventListener("pointerenter", onEnter);
      root.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <figure
      className={`border-y border-white/15 bg-black text-white ${className}`}
      aria-label={t("Estudio de movimiento: un caballo galopando descompuesto en seis fotogramas dibujados con caracteres tipográficos. El ciclo se repite para avanzar.")}
    >
      <figcaption className="mono-label flex flex-wrap items-center justify-between gap-3 border-b border-white/15 px-5 py-2.5 sm:px-8">
        <span>{t("ITER — Estudio de movimiento N.º 002")}</span>
        <span className="hidden items-center gap-2 sm:flex" aria-hidden="true">
          <span className="inline-block h-2 w-2 bg-red" />
          {t("Galope / iteración")}
        </span>
      </figcaption>

      <div
        ref={rootRef}
        className="relative h-[240px] touch-pan-y overflow-hidden sm:h-[300px] lg:h-[340px]"
      >
        <pre
          ref={groundRef}
          aria-hidden="true"
          className="font-mono absolute inset-0 m-0 select-none overflow-hidden whitespace-pre p-0 text-white/40"
        />
        <pre
          ref={horseRef}
          aria-hidden="true"
          className="font-mono absolute inset-0 m-0 select-none overflow-hidden whitespace-pre p-0 text-white"
        />
      </div>

      <div className="mono-label grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-t border-white/15 px-5 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] sm:px-8">
        <span ref={frameRef} className="text-red tabular-nums">
          F01/06
        </span>
        <span className="hidden min-w-0 sm:block">
          {t("Locomoción secuencial → retícula tipográfica")}
        </span>
        <span className="min-w-0 text-right text-white/50">{t("Un ciclo que se repite para avanzar")}</span>
      </div>
    </figure>
  );
}
