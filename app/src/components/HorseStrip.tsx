import { useEffect, useId, useRef, useState } from "react";
import { fitAsciiGrid, idleAsciiPointer, wrap } from "@/lib/asciiGrid";
import { horseCycleRate, renderAsciiHorse } from "@/lib/asciiHorse";
import { createAsciiScene, useAsciiMotionMode } from "@/lib/asciiRuntime";
import type { AsciiSceneController } from "@/lib/asciiRuntime";
import { useLocale } from "@/providers/LocaleProvider";

const INITIAL_FRAME = renderAsciiHorse(
  fitAsciiGrid(720, 360, 0.6, 84),
  0.12,
  idleAsciiPointer
);

export default function HorseStrip({ className = "" }: { className?: string }) {
  const { locale, t } = useLocale();
  const mode = useAsciiMotionMode();
  const [paused, setPaused] = useState(false);
  const sceneId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const horseRef = useRef<HTMLPreElement>(null);
  const groundRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const controllerRef = useRef<AsciiSceneController | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const horse = horseRef.current;
    const ground = groundRef.current;
    if (!root || !horse || !ground) return;
    let progress = 0.12;
    const controller = createAsciiScene({
      root,
      layers: [horse, ground],
      mode,
      fps: 30,
      columns: width =>
        width < 640 ? 72 : Math.min(164, Math.round(width / 8)),
      paint(grid, _elapsed, delta, pointer) {
        progress = wrap(progress + delta * horseCycleRate(pointer));
        const frame = renderAsciiHorse(grid, progress, pointer);
        horse.textContent = frame.horse;
        ground.textContent = frame.ground;
        if (frameRef.current) {
          frameRef.current.textContent = `F${String(Math.floor(progress * 32) + 1).padStart(2, "0")}/32`;
        }
      },
    });
    controllerRef.current = controller;
    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    controllerRef.current?.setPaused(paused);
  }, [paused, mode]);

  const staticDescription =
    mode === "reduced"
      ? t("Animación desactivada por la preferencia de movimiento reducido.")
      : t("Vista estática en dispositivos táctiles.");

  return (
    <figure
      lang={locale}
      className={`min-w-0 border-y border-white/20 bg-black text-white ${className}`}
      aria-label={t(
        "Estudio de movimiento: silueta original de un caballo al galope, dibujada con caracteres ASCII."
      )}
    >
      <figcaption className="mono-label flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-white/20 px-4 py-3 [overflow-wrap:anywhere] sm:px-8">
        <span className="min-w-0">
          {t("ITER — Estudio de movimiento N.º 002")}
        </span>
        <span className="min-w-0">{t("Galope / iteración")}</span>
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
          className="min-h-11 max-w-full border border-white/60 px-3 py-2 text-left hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-default disabled:border-white/30 disabled:bg-transparent disabled:text-white/70"
        >
          {mode === "animated"
            ? t(paused ? "Reanudar" : "Pausar")
            : t("Imagen estática")}
        </button>
      </figcaption>

      <div
        id={sceneId}
        ref={rootRef}
        className="relative w-full touch-pan-y overflow-hidden"
        style={{ height: "clamp(260px, 34vw, 480px)" }}
      >
        <pre
          ref={groundRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 select-none overflow-hidden whitespace-pre p-0 font-mono text-white/30"
          style={{
            fontSize: "10px",
            lineHeight: "12.2px",
            letterSpacing: 0,
            fontVariantLigatures: "none",
          }}
        >
          {INITIAL_FRAME.ground}
        </pre>
        <pre
          ref={horseRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 select-none overflow-hidden whitespace-pre p-0 font-mono text-white"
          style={{
            fontSize: "10px",
            lineHeight: "12.2px",
            letterSpacing: 0,
            fontVariantLigatures: "none",
          }}
        >
          {INITIAL_FRAME.horse}
        </pre>
      </div>

      <div className="mono-label flex flex-wrap items-start gap-x-5 gap-y-2 border-t border-white/20 px-4 py-3 [overflow-wrap:anywhere] sm:px-8">
        <span
          ref={frameRef}
          aria-hidden="true"
          className="shrink-0 tabular-nums"
        >
          F04/32
        </span>
        <span className="min-w-0 flex-1 basis-56">
          {t("Locomoción secuencial → retícula tipográfica")}
        </span>
        <span className="min-w-0 flex-1 basis-56 text-white/70">
          {t("Un ciclo que se repite para avanzar")}
        </span>
        <span className="w-full text-white/70">
          {mode === "animated"
            ? t(
                "El cursor modula el ritmo, la posición y la tensión del galope."
              )
            : staticDescription}
        </span>
      </div>
    </figure>
  );
}
