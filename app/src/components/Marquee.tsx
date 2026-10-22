import { useEffect, useRef } from "react";
import { useLocale } from "@/providers/LocaleProvider";

/**
 * Cinta divisoria tipográfica. Separadores, no adornos:
 * lleva las tres frases del sistema de marca.
 */
export default function Marquee({
  items,
  dark = false,
  className = "",
}: {
  items: string[];
  dark?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    let visible = false;
    const sync = () => {
      track.style.animationPlayState = visible && !document.hidden ? "running" : "paused";
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const row = (copy: "first" | "second") => (
    <div className="marquee__group" key={copy}>
      {items.map((item, i) => (
        <span key={`${copy}-${i}`} className="flex shrink-0 items-center">
          <span className="px-6">{t(item)}</span>
          <span aria-hidden="true" className="px-1 text-red">
            ·
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`marquee hairline-t hairline-b min-w-0 max-w-full py-3 ${
        dark ? "border-white/20 bg-black text-white" : "bg-paper text-ink"
      } ${className}`}
      aria-hidden="true"
    >
      <div ref={trackRef} className="marquee__track mono-label">
        {row("first")}
        {row("second")}
      </div>
    </div>
  );
}
