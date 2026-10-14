import { useSyncExternalStore } from "react";
import { clamp, fitAsciiGrid, mix } from "./asciiGrid";
import type { AsciiGrid, AsciiPointer } from "./asciiGrid";

export type AsciiMotionMode = "animated" | "reduced" | "touch";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_QUERY = "(hover: hover) and (pointer: fine)";

function motionSnapshot(): AsciiMotionMode {
  if (window.matchMedia(REDUCED_QUERY).matches) return "reduced";
  return window.matchMedia(FINE_QUERY).matches ? "animated" : "touch";
}

function subscribeMotion(notify: () => void) {
  const queries = [
    window.matchMedia(REDUCED_QUERY),
    window.matchMedia(FINE_QUERY),
  ];
  queries.forEach(query => query.addEventListener("change", notify));
  return () =>
    queries.forEach(query => query.removeEventListener("change", notify));
}

export function useAsciiMotionMode() {
  return useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    (): AsciiMotionMode => "reduced"
  );
}

interface AsciiSceneOptions {
  root: HTMLElement;
  layers: HTMLPreElement[];
  mode: AsciiMotionMode;
  fps: number;
  columns: (width: number) => number;
  paint: (
    grid: AsciiGrid,
    elapsed: number,
    delta: number,
    pointer: AsciiPointer
  ) => void;
  pointerScope?: "local" | "window";
  continuous?: boolean;
}

export interface AsciiSceneController {
  setPaused: (paused: boolean) => void;
  dispose: () => void;
}

/** No idle RAFs: visibility, manual pause and input capability gate scheduling itself. */
export function createAsciiScene(
  options: AsciiSceneOptions
): AsciiSceneController {
  const { root, layers, mode, fps, columns, paint } = options;
  const continuous = options.continuous ?? true;
  const eventTarget = options.pointerScope === "window" ? window : root;
  const pointer: AsciiPointer = { x: 0, y: 0, strength: 0 };
  let tx = 0;
  let ty = 0;
  let targetStrength = 0;
  let elapsed = 0;
  let lastPaint = 0;
  let nextPaint = 0;
  let raf = 0;
  let paused = false;
  let disposed = false;
  let dirty = false;
  let grid: AsciiGrid | undefined;
  const initialRect = root.getBoundingClientRect();
  let inView =
    initialRect.bottom > 0 &&
    initialRect.top < window.innerHeight &&
    initialRect.right > 0 &&
    initialRect.left < window.innerWidth;

  const canAnimate = () =>
    !disposed && !paused && mode === "animated" && inView && !document.hidden;
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    lastPaint = 0;
    nextPaint = 0;
  };
  const schedule = () => {
    if (canAnimate() && (continuous || dirty)) {
      if (!raf) raf = requestAnimationFrame(loop);
    } else stop();
  };

  function loop(now: number) {
    raf = 0;
    if (!canAnimate()) return;
    const interval = 1000 / fps;
    if (nextPaint && now + 0.2 < nextPaint) {
      schedule();
      return;
    }
    const delta = lastPaint
      ? clamp((now - lastPaint) / 1000, 0, 0.08)
      : 1 / fps;
    lastPaint = now;
    // Keep the deadline's remainder so a 60Hz display doesn't quantize 28/30fps to 20fps.
    nextPaint = nextPaint
      ? Math.max(nextPaint + interval, now + 1)
      : now + interval;
    if (continuous) elapsed += delta;
    const blend = 1 - Math.exp(-delta * 22);
    pointer.x = mix(pointer.x, tx, blend);
    pointer.y = mix(pointer.y, ty, blend);
    pointer.strength = mix(pointer.strength, targetStrength, blend);
    dirty =
      Math.abs(pointer.x - tx) > 0.003 ||
      Math.abs(pointer.y - ty) > 0.003 ||
      Math.abs(pointer.strength - targetStrength) > 0.003;
    if (!dirty) {
      pointer.x = tx;
      pointer.y = ty;
      pointer.strength = targetStrength;
    }
    if (grid) paint(grid, elapsed, delta, pointer);
    schedule();
  }

  function measure() {
    if (disposed) return;
    const rect = root.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const style = getComputedStyle(layers[0]);
    const probe = document.createElement("span");
    probe.textContent = "M".repeat(64);
    Object.assign(probe.style, {
      position: "absolute",
      visibility: "hidden",
      pointerEvents: "none",
      whiteSpace: "pre",
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fontSize: "100px",
      lineHeight: "1",
      letterSpacing: "0px",
      fontVariantLigatures: "none",
      fontKerning: "none",
    });
    probe.setAttribute("aria-hidden", "true");
    root.appendChild(probe);
    const glyphRatio = probe.getBoundingClientRect().width / 64 / 100;
    probe.remove();
    grid = fitAsciiGrid(
      rect.width,
      rect.height,
      glyphRatio,
      columns(rect.width)
    );
    for (const layer of layers) {
      Object.assign(layer.style, {
        fontSize: `${grid.fontSize}px`,
        lineHeight: `${grid.lineHeight}px`,
        letterSpacing: "0px",
        fontVariantLigatures: "none",
        fontKerning: "none",
        width: `${grid.width}px`,
        height: `${grid.height}px`,
        left: `${(rect.width - grid.width) / 2}px`,
        top: `${(rect.height - grid.height) / 2}px`,
      });
    }
    // A resize/font load repaints even a paused, reduced-motion or touch scene.
    paint(grid, elapsed, 0, pointer);
  }

  const onPointer = (event: PointerEvent) => {
    if (!canAnimate() || event.pointerType === "touch") return;
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      onLeave();
      return;
    }
    tx = x * 2 - 1;
    ty = y * 2 - 1;
    if (!targetStrength) {
      pointer.x = tx;
      pointer.y = ty;
      pointer.strength = 0.65;
    }
    targetStrength = 1;
    dirty = true;
    schedule();
  };
  const onLeave = () => {
    if (!targetStrength) return;
    targetStrength = 0;
    dirty = true;
    schedule();
  };
  const onVisibility = () => {
    if (document.hidden) {
      targetStrength = 0;
      pointer.strength = 0;
    }
    schedule();
  };
  const onWindowLeave = (event: PointerEvent) => {
    if (!event.relatedTarget) onLeave();
  };
  const onViewport = () => {
    const rect = root.getBoundingClientRect();
    inView =
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth;
    schedule();
  };
  const onResize = () => {
    measure();
    onViewport();
  };

  const ro =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(measure)
      : undefined;
  ro?.observe(root);
  const io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            if (!inView) {
              targetStrength = 0;
              pointer.strength = 0;
            }
            schedule();
          },
          { threshold: 0 }
        )
      : undefined;
  io?.observe(root);
  if (!io) window.addEventListener("scroll", onViewport, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  document.fonts?.addEventListener("loadingdone", measure);
  void document.fonts?.ready.then(() => {
    if (!disposed) measure();
  });
  if (mode === "animated") {
    eventTarget.addEventListener("pointermove", onPointer as EventListener, {
      passive: true,
    });
    root.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("pointerout", onWindowLeave, { passive: true });
    window.addEventListener("blur", onLeave);
  }
  measure();
  schedule();

  return {
    setPaused(value) {
      paused = value;
      schedule();
    },
    dispose() {
      disposed = true;
      stop();
      ro?.disconnect();
      io?.disconnect();
      window.removeEventListener("scroll", onViewport);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      document.fonts?.removeEventListener("loadingdone", measure);
      eventTarget.removeEventListener(
        "pointermove",
        onPointer as EventListener
      );
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerout", onWindowLeave);
      window.removeEventListener("blur", onLeave);
    },
  };
}
