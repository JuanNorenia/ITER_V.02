import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLocale } from "@/providers/LocaleProvider";

/**
 * ESTUDIO DE MOVIMIENTO N.º 001
 *
 * Principio: el movimiento secuencial (los estudios de crono-fotografía)
 * traducido a una retícula tipográfica en tiempo real. No hay imagen:
 * cada fotograma se calcula y se dibuja con caracteres.
 *
 * El ciclo narra el sistema de ITER: BUILD → SHIFT → CUT → RE.
 * El cursor actúa como lente que desplaza localmente el campo (SHIFT).
 */

const RAMP = [" ", "·", ":", ";", "+", "=", "*", "#", "%", "■"];
const FPS_INTERVAL = 1000 / 21;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const sdDisc = (x: number, y: number, cx: number, cy: number, r: number) =>
  Math.hypot(x - cx, y - cy) - r;
const sdBox = (x: number, y: number, h: number) =>
  Math.max(Math.abs(x) - h, Math.abs(y) - h);
/** Distancia → densidad 0..1 con borde suave (da la rampa de grises) */
const dens = (sd: number) => clamp01((0.02 - sd) / 0.045);

const hash = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type Phase = "BUILD" | "SHIFT" | "CUT" | "RE";

function phaseOf(u: number): Phase {
  if (u < 0.3) return "BUILD";
  if (u < 0.6) return "SHIFT";
  if (u < 0.85) return "CUT";
  return "RE";
}

/** Campo de densidad del ciclo BUILD → SHIFT → CUT → RE */
function field(x: number, y: number, u: number, A: number): number {
  let d = 0;

  if (u < 0.3) {
    // BUILD: unidades discretas se ensamblan en una forma
    const k = u / 0.3;
    const steps = 6;
    const kk = Math.floor(k * steps + 0.0001) / steps;
    const R = 0.68 * easeOut(kk);
    d = Math.max(d, dens(sdDisc(x, y, 0, 0, R)));
    const conv = easeInOut(Math.min(1, k * 1.15));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const orbit = lerp(1.65, 0.85, conv);
      const sx = Math.cos(a) * orbit * A * 0.55;
      const sy = Math.sin(a) * orbit;
      d = Math.max(d, dens(sdBox(x - sx, y - sy, 0.058)));
    }
  } else if (u < 0.6) {
    // SHIFT: la forma se cisaña; un módulo la atraviesa
    const k = (u - 0.3) / 0.3;
    const shear = (easeInOut(k) - 0.5) * 2;
    d = Math.max(d, dens(sdDisc(x - y * 0.55 * shear, y, 0, 0, 0.68)));
    const sqx = lerp(-A - 0.35, A * 0.42, easeInOut(k));
    d = Math.max(d, dens(sdBox(x - sqx, y, 0.23)));
  } else if (u < 0.85) {
    // CUT: una barra vacía barre la composición y la sustrae
    const k = (u - 0.6) / 0.25;
    d = Math.max(d, dens(sdDisc(x - y * 0.55, y, 0, 0, 0.68)));
    d = Math.max(d, dens(sdBox(x - A * 0.42, y, 0.23)));
    const sweep = lerp(-A - 0.3, A + 0.3, easeInOut(k));
    if (Math.abs(x - sweep) < 0.16) d = 0;
  } else {
    // RE: la forma se disuelve de vuelta a la retícula
    const k = easeInOut((u - 0.85) / 0.15);
    d = Math.max(d, dens(sdDisc(x, y, 0, 0, 0.68 * (1 - k))));
    d = Math.max(d, dens(sdBox(x - A * 0.42, y, 0.23 * (1 - k))));
  }

  return d;
}

export default function AsciiStudy({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const chipRefs = useRef<Record<Phase, HTMLSpanElement | null>>({
    BUILD: null,
    SHIFT: null,
    CUT: null,
    RE: null,
  });

  useEffect(() => {
    const root = rootRef.current;
    const pre = preRef.current;
    if (!root || !pre) return;

    let raf = 0;
    let last = 0;
    let visible = false;
    let pageVisible = !document.hidden;
    let cols = 0;
    let rows = 0;
    let fieldW = 0;
    let fieldH = 0;
    let aspect = 1;
    const start = performance.now();
    const pointer = { x: 99, y: 99, tx: 99, ty: 99, active: false };

    const render = (u: number, tSec: number) => {
      if (!cols || !rows) return;
      // Lente del cursor: desplazamiento local del campo
      pointer.x = lerp(pointer.x, pointer.tx, 0.12);
      pointer.y = lerp(pointer.y, pointer.ty, 0.12);

      const lines: string[] = [];
      for (let j = 0; j < rows; j++) {
        const y = (j / (rows - 1)) * 2 - 1;
        let line = "";
        for (let i = 0; i < cols; i++) {
          const x = ((i / (cols - 1)) * 2 - 1) * aspect;

          // Retícula base: el sistema siempre está presente
          let d = 0.105 + hash(i, j) * 0.035;

          let sx = x;
          let sy = y;
          if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const fall = Math.exp(-(dx * dx + dy * dy) / 0.09);
            const inv = fall / (Math.hypot(dx, dy) + 0.0001);
            sx = x + dx * inv * 0.16;
            sy = y + dy * inv * 0.16;
            d += fall * 0.1;
          }

          d = Math.max(d, field(sx, sy, u, aspect));

          const idx = Math.min(RAMP.length - 1, Math.floor(d * RAMP.length));
          line += RAMP[idx];
        }
        lines.push(line);
      }
      pre.textContent = lines.join("\n");

      // Capa INFORMATION: contador de fotograma + fase activa
      const f = Math.floor(u * 24) + 1;
      if (frameRef.current) {
        frameRef.current.textContent = `F${String(f).padStart(2, "0")}/24`;
      }
      const ph = phaseOf(u);
      (Object.keys(chipRefs.current) as Phase[]).forEach((key) => {
        const el = chipRefs.current[key];
        if (!el) return;
        const on = key === ph;
        el.style.backgroundColor = on ? "#e2251b" : "transparent";
        el.style.color = on ? "#ffffff" : "";
        el.style.borderColor = on ? "#e2251b" : "";
      });
      void tSec;
    };

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w < 10 || h < 10) return;
      const targetCols = w < 560 ? 52 : 88;
      const fontSize = w / (targetCols * 0.6);
      const lineH = fontSize * 1.04;
      cols = targetCols;
      rows = Math.max(8, Math.floor(h / lineH));
      aspect = (w / h) * (lineH / (fontSize * 0.6)) * 0.6;
      aspect = w / h; // coordenadas corregidas por la celda de caracteres
      pre.style.fontSize = `${fontSize}px`;
      pre.style.lineHeight = `${lineH}px`;
      fieldW = w;
      fieldH = h;
    };

    const loop = (now: number) => {
      if (now - last < FPS_INTERVAL) {
        raf = requestAnimationFrame(loop);
        return;
      }
      last = now;
      const tSec = (now - start) / 1000;
      const u = (tSec % 9) / 9;
      render(u, tSec);
      raf = requestAnimationFrame(loop);
    };
    const syncLoop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (visible && pageVisible && !reduced) raf = requestAnimationFrame(loop);
    };
    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      syncLoop();
    };

    const onPointer = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointer.tx = nx * aspect;
      pointer.ty = ny;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.tx = 99;
      pointer.ty = 99;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncLoop();
      },
      { threshold: 0.05 },
    );
    io.observe(root);

    if (reduced) {
      // Alternativa estática: un fotograma representativo del ciclo
      render(0.42, 0);
    } else {
      root.addEventListener("pointermove", onPointer);
      root.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      root.removeEventListener("pointermove", onPointer);
      root.removeEventListener("pointerleave", onLeave);
      void fieldW;
      void fieldH;
    };
  }, [reduced]);

  const chip = (key: Phase, label: string) => (
    <span
      key={key}
      ref={(el) => {
        chipRefs.current[key] = el;
      }}
      className="border border-current px-1.5 py-0.5 transition-colors duration-200"
    >
      {label}
    </span>
  );

  return (
    <figure
      className={`flex min-w-0 flex-col border border-ink bg-paper ${className}`}
      aria-label={t("Estudio de movimiento: figuras geométricas que se construyen, se desplazan y se recortan en bucle, dibujadas con caracteres tipográficos.")}
    >
      <figcaption className="mono-label flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-ink px-3 py-2">
        <span className="min-w-0">{t("ITER — Estudio de movimiento N.º 001")}</span>
        <span className="hidden shrink-0 gap-1 sm:flex" aria-hidden="true">
          {chip("BUILD", "Build")}
          {chip("SHIFT", "Shift")}
          {chip("CUT", "Cut")}
          {chip("RE", "Re")}
        </span>
      </figcaption>

      <div
        ref={rootRef}
        className="relative min-h-[280px] flex-1 touch-pan-y overflow-hidden sm:min-h-[340px]"
      >
        <pre
          ref={preRef}
          aria-hidden="true"
          className="font-mono absolute inset-0 m-0 select-none overflow-hidden whitespace-pre p-0 text-ink"
        />
      </div>

      <div className="mono-label grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-t border-ink px-3 py-2 text-ink">
        <span ref={frameRef} className="whitespace-nowrap tabular-nums">F01/24</span>
        <span className="min-w-0 text-center">{t("Movimiento secuencial → retícula tipográfica")}</span>
        <span className="whitespace-nowrap" aria-hidden="true">
          Loop<span className="blink">_</span>
        </span>
      </div>
    </figure>
  );
}
