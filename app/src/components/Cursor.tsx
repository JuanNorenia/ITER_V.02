import { useEffect, useRef } from "react";
import { useFinePointer } from "@/hooks/useFinePointer";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Cursor ITER: un cuadrado (nada de círculos suaves) con blend difference.
 *  - Estado base: marcador pequeño.
 *  - Sobre enlaces/botones: crece.
 *  - Sobre [data-cursor="TEXTO"]: muestra una etiqueta de contexto.
 *  - Sobre [data-magnetic]: el elemento es atraído sutilmente hacia el cursor.
 * Solo existe con puntero fino y sin preferencia de movimiento reducido.
 */
export default function Cursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fine || reduced) return;
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.classList.add("has-cursor");

    const pos = { x: -100, y: -100, tx: -100, ty: -100, seen: false };
    let raf = 0;
    let clickTimer = 0;
    let magneticEl: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      if (!pos.seen) {
        pos.seen = true;
        pos.x = pos.tx;
        pos.y = pos.ty;
        root.classList.add("is-visible");
      }

      const target = (e.target as HTMLElement | null)?.closest?.(
        "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor]",
      ) as HTMLElement | null;

      const labelled = target?.closest("[data-cursor]") as HTMLElement | null;
      if (labelled?.dataset.cursor) {
        root.classList.add("has-label");
        root.classList.remove("is-active");
        const labelEl = root.querySelector(".iter-cursor__label");
        if (labelEl) labelEl.textContent = labelled.dataset.cursor;
      } else if (target) {
        root.classList.add("is-active");
        root.classList.remove("has-label");
      } else {
        root.classList.remove("is-active", "has-label");
      }

      // Magnetismo: solo el candidato más cercano con data-magnetic
      const magnet = (e.target as HTMLElement | null)?.closest?.(
        "[data-magnetic]",
      ) as HTMLElement | null;
      if (magnet !== magneticEl) {
        if (magneticEl) {
          magneticEl.style.transform = "";
          magneticEl.style.transition =
            "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        }
        magneticEl = magnet;
        if (magneticEl) magneticEl.style.transition = "transform 0.15s linear";
      }
      if (magneticEl) {
        const r = magneticEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) * 0.18;
        const dy = (e.clientY - cy) * 0.22;
        magneticEl.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
    };

    const onLeaveWindow = () => root.classList.remove("is-visible");
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      window.clearTimeout(clickTimer);
      root.classList.add("is-pressed", "is-clicking");
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return;
      root.classList.remove("is-pressed");
      clickTimer = window.setTimeout(() => root.classList.remove("is-clicking"), 420);
    };
    const clearPressed = () => {
      root.classList.remove("is-pressed", "is-clicking");
      window.clearTimeout(clickTimer);
    };
    const onPointerCancel = clearPressed;
    const onWindowBlur = clearPressed;
    const onEnterWindow = () => {
      if (pos.seen) root.classList.add("is-visible");
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      pos.x += (pos.tx - pos.x) * 0.2;
      pos.y += (pos.ty - pos.y) * 0.2;
      root.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("blur", onWindowBlur);
    document.documentElement.addEventListener(
      "pointerleave",
      onLeaveWindow,
    );
    document.documentElement.addEventListener("pointerenter", onEnterWindow);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clickTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("blur", onWindowBlur);
      document.documentElement.removeEventListener(
        "pointerleave",
        onLeaveWindow,
      );
      document.documentElement.removeEventListener(
        "pointerenter",
        onEnterWindow,
      );
      document.documentElement.classList.remove("has-cursor");
      if (magneticEl) magneticEl.style.transform = "";
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div ref={rootRef} className="iter-cursor" aria-hidden="true">
      <div className="iter-cursor__box">
        <span className="iter-cursor__label" />
      </div>
    </div>
  );
}
