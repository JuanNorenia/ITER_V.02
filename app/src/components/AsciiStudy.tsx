import { useEffect, useId, useRef, useState } from "react";
import { fitAsciiGrid, idleAsciiPointer } from "@/lib/asciiGrid";
import { ASCII_PHASES, asciiPhaseAt, renderAsciiStudy } from "@/lib/asciiStudy";
import type { AsciiPhase } from "@/lib/asciiStudy";
import { createAsciiScene, useAsciiMotionMode } from "@/lib/asciiRuntime";
import type { AsciiSceneController } from "@/lib/asciiRuntime";
import { useLocale } from "@/providers/LocaleProvider";

const INITIAL_FRAME = renderAsciiStudy(
  fitAsciiGrid(560, 320, 0.6, 64),
  0.42,
  idleAsciiPointer
);

export interface AsciiStudyProps {
  className?: string;
  variant?: "panel" | "background";
}

export default function AsciiStudy({
  className = "",
  variant = "panel",
}: AsciiStudyProps) {
  const { locale, t } = useLocale();
  const mode = useAsciiMotionMode();
  const [paused, setPaused] = useState(false);
  const sceneId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const controllerRef = useRef<AsciiSceneController | null>(null);
  const chipRefs = useRef<Partial<Record<AsciiPhase, HTMLSpanElement | null>>>(
    {}
  );

  useEffect(() => {
    const root = rootRef.current;
    const pre = preRef.current;
    if (!root || !pre) return;
    const controller = createAsciiScene({
      root,
      layers: [pre],
      mode,
      fps: 28,
      columns: width =>
        width < 560 ? 58 : Math.min(128, Math.round(width / 8)),
      pointerScope: variant === "background" ? "window" : "local",
      // The decorative background has no autonomous loop requiring a hidden pause control.
      continuous: variant === "panel",
      paint(grid, elapsed, _delta, pointer) {
        const progress = (0.42 + elapsed / 9) % 1;
        pre.textContent = renderAsciiStudy(grid, progress, pointer);
        if (frameRef.current) {
          frameRef.current.textContent = `F${String(Math.floor(progress * 24) + 1).padStart(2, "0")}/24`;
        }
        const phase = asciiPhaseAt(progress);
        for (const key of ASCII_PHASES) {
          const chip = chipRefs.current[key];
          if (chip) chip.dataset.active = String(key === phase);
        }
      },
    });
    controllerRef.current = controller;
    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [mode, variant]);

  useEffect(() => {
    controllerRef.current?.setPaused(paused);
  }, [paused, mode, variant]);

  const artwork = (
    <pre
      ref={preRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 m-0 select-none overflow-hidden whitespace-pre p-0 font-mono text-ink"
      style={{
        fontSize: "10px",
        lineHeight: "12.2px",
        letterSpacing: 0,
        fontVariantLigatures: "none",
      }}
    >
      {INITIAL_FRAME}
    </pre>
  );

  if (variant === "background") {
    return (
      <div
        ref={rootRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden text-ink opacity-[0.12] ${className}`}
        style={{ pointerEvents: "none" }}
      >
        {artwork}
      </div>
    );
  }

  const staticDescription =
    mode === "reduced"
      ? t("Animación desactivada por la preferencia de movimiento reducido.")
      : t("Vista estática en dispositivos táctiles.");

  return (
    <figure
      lang={locale}
      className={`flex min-h-[420px] min-w-0 flex-col border border-ink bg-paper sm:min-h-[480px] ${className}`}
      // Captions can grow when translated or zoomed, regardless of a caller's fixed height.
      style={{ height: "auto" }}
      aria-label={t(
        "Estudio de movimiento: figuras geométricas que se construyen, se desplazan y se recortan, dibujadas con caracteres ASCII."
      )}
    >
      <figcaption className="mono-label flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ink px-3 py-2 [overflow-wrap:anywhere]">
        <span className="min-w-0">
          {t("ITER — Estudio de movimiento N.º 001")}
        </span>
        <button
          type="button"
          aria-controls={sceneId}
          aria-pressed={paused}
          aria-label={
            mode === "animated"
              ? t(paused ? "Reanudar animación" : "Pausar animación")
              : staticDescription
          }
          disabled={mode !== "animated"}
          onClick={() => setPaused(value => !value)}
          className="min-h-11 max-w-full border border-ink px-3 py-2 text-left hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-default disabled:border-ink/30 disabled:bg-transparent disabled:text-smoke"
        >
          {mode === "animated"
            ? t(paused ? "Reanudar" : "Pausar")
            : t("Imagen estática")}
        </button>
        <span className="flex w-full flex-wrap gap-1" aria-hidden="true">
          {ASCII_PHASES.map(phase => (
            <span
              key={phase}
              ref={element => {
                chipRefs.current[phase] = element;
              }}
              data-active={phase === "SHIFT"}
              className="border border-ink px-1.5 py-0.5 data-[active=true]:bg-ink data-[active=true]:text-paper"
            >
              {phase}
            </span>
          ))}
        </span>
      </figcaption>

      <div
        id={sceneId}
        ref={rootRef}
        className="relative min-h-[260px] flex-1 touch-pan-y overflow-hidden sm:min-h-[320px]"
      >
        {artwork}
      </div>

      <div className="mono-label flex shrink-0 flex-wrap items-start gap-x-4 gap-y-2 border-t border-ink px-3 py-3 text-ink [overflow-wrap:anywhere]">
        <span
          ref={frameRef}
          aria-hidden="true"
          className="shrink-0 tabular-nums"
        >
          F11/24
        </span>
        <span className="min-w-0 flex-1 basis-48">
          {t("Movimiento secuencial → retícula tipográfica")}
        </span>
        <span className="w-full text-smoke">
          {mode === "animated"
            ? t("El cursor desplaza, deforma y recorta el campo.")
            : staticDescription}
        </span>
      </div>
    </figure>
  );
}
