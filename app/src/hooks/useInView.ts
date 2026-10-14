import { useEffect, useRef } from "react";

/**
 * Observa un elemento y le añade la clase `is-in` cuando entra al viewport.
 * Una sola activación (no reversible) para mantener la calma visual.
 */
export function useInView<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.classList.contains("rv-observe")
      ? [el, ...Array.from(el.querySelectorAll(".rv, .rv-line, .rv-cut"))]
      : [el];

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}
