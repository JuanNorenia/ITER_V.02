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
  const row = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="px-6">{t(item)}</span>
          <span aria-hidden="true" className="px-1 text-red">
            ·
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className={`marquee hairline-t hairline-b min-w-0 max-w-full py-3 ${
        dark ? "border-white/20 bg-black text-white" : "bg-paper text-ink"
      } ${className}`}
      aria-hidden="true"
    >
      <div className="marquee__track mono-label w-max">
        <div className="flex shrink-0">{row}</div>
        <div className="flex shrink-0">{row}</div>
      </div>
    </div>
  );
}
