import { useEffect, useRef } from "react";
import { useFinePointer } from "@/hooks/useFinePointer";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { contactAsciiFrame } from "@/lib/contactAscii";

/** Campo independiente: nunca altera el estudio ASCII original del hero. */
export default function ContactAsciiBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const pre = preRef.current;
    const page = root?.parentElement;
    if (!root || !pre || !page) return;

    const animated = fine && !reduced;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let lastFrame = 0;
    let visible = true;
    let pointer: { x: number; y: number } | undefined;
    const started = performance.now();

    const draw = (now: number) => {
      pre.textContent = contactAsciiFrame(
        cols, rows, animated ? (now - started) / 12000 : 0.42, pointer,
      );
    };
    const measure = () => {
      const { width, height } = root.getBoundingClientRect();
      if (!width || !height) return;
      cols = Math.min(128, Math.max(32, Math.ceil(width / 10)));
      const cell = width / cols;
      rows = Math.min(96, Math.max(24, Math.ceil(height / (cell * 1.7))));
      pre.style.fontSize = `${cell / 0.6}px`;
      pre.style.lineHeight = `${height / rows}px`;
      draw(performance.now());
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < 1000 / 16) return;
      lastFrame = now;
      draw(now);
    };
    const syncAnimation = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (animated && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const onPointer = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };
    const onLeave = () => { pointer = undefined; };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    intersection.observe(root);
    document.addEventListener("visibilitychange", syncAnimation);
    if (animated) {
      page.addEventListener("pointermove", onPointer, { passive: true });
      page.addEventListener("pointerleave", onLeave);
    }
    syncAnimation();

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      page.removeEventListener("pointermove", onPointer);
      page.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, reduced]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <pre ref={preRef} className="absolute inset-0 m-0 select-none overflow-hidden whitespace-pre p-0 font-mono text-ink/45" />
    </div>
  );
}
