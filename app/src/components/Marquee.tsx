import { useLocale } from "@/providers/LocaleProvider";

/** Static typographic divider: one accessible copy, no continuous motion. */
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

  return (
    <div
      className={`hairline-t hairline-b py-3 ${
        dark ? "border-white/20 bg-black text-white" : "bg-paper text-ink"
      } ${className}`}
    >
      <ul className="mono-label flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 sm:px-8">
        {items.map((item, i) => (
          <li key={i} className="flex min-w-0 items-center gap-8">
            <span className="min-w-0 break-words">{t(item)}</span>
            <span aria-hidden="true" className="shrink-0 text-red">
              ·
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
