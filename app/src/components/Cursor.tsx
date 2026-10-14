import { useEffect, useRef } from "react";
import { useFinePointer } from "@/hooks/useFinePointer";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLocale } from "@/providers/LocaleProvider";

/** Small supplementary marker; never hides the native cursor. */
export default function Cursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const { t } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!fine || reduced) return;
    const root = rootRef.current;
    if (!root) return;

    const pos = { x: -100, y: -100, tx: -100, ty: -100, seen: false };
    let raf = 0;
    let magneticEl: HTMLElement | null = null;
    let previousTransform = "";
    let previousTransition = "";

    const resetMagnet = () => {
      if (!magneticEl) return;
      magneticEl.style.transform = previousTransform;
      magneticEl.style.transition = previousTransition;
      magneticEl = null;
    };
    const hide = () => {
      root.classList.remove("is-visible");
      if (labelRef.current) labelRef.current.textContent = "";
      resetMagnet();
    };
    const isTextField = (element: Element | null) =>
      element?.closest(
        "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox']"
      );

    const onMove = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (e.pointerType === "touch" || isTextField(target)) {
        hide();
        return;
      }

      pos.tx = e.clientX;
      pos.ty = e.clientY;
      if (!pos.seen) {
        pos.seen = true;
        pos.x = pos.tx;
        pos.y = pos.ty;
      }
      root.classList.add("is-visible");

      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelRef.current) {
        labelRef.current.textContent = labelled?.dataset.cursor
          ? t(labelled.dataset.cursor)
          : "";
      }

      const magnet = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet !== magneticEl) {
        resetMagnet();
        magneticEl = magnet;
        if (magneticEl) {
          previousTransform = magneticEl.style.transform;
          previousTransition = magneticEl.style.transition;
          magneticEl.style.transition = "transform 0.15s linear";
        }
      }
      if (magneticEl) {
        const r = magneticEl.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.12;
        magneticEl.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
    };
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Element && isTextField(e.target)) hide();
    };
    const loop = () => {
      pos.x += (pos.tx - pos.x) * 0.2;
      pos.y += (pos.ty - pos.y) * 0.2;
      root.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("focusin", onFocus);
    document.documentElement.addEventListener("pointerleave", hide);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", hide);
      document.removeEventListener("focusin", onFocus);
      document.documentElement.removeEventListener("pointerleave", hide);
      hide();
    };
  }, [fine, reduced, t]);

  if (!fine || reduced) return null;

  return (
    <div ref={rootRef} className="iter-cursor" aria-hidden="true">
      <div
        className="iter-cursor__box"
        style={{ width: 8, height: 8, margin: "-4px 0 0 -4px" }}
      />
      <span
        ref={labelRef}
        className="iter-cursor__label"
        style={{
          position: "absolute",
          top: 12,
          left: 10,
          opacity: 1,
          color: "white",
        }}
      />
    </div>
  );
}
