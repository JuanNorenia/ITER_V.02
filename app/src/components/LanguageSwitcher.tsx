import { isLocale, locales } from "@/lib/locale";
import { useLocale } from "@/providers/LocaleProvider";

const names = { es: "Español", en: "Inglés", fr: "Francés" } as const;

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <label
      data-magnetic
      data-cursor={t(names[locale])}
      className="flex h-12 w-36 min-w-0 shrink-0 items-center border border-white transition-colors duration-300 hover:bg-white hover:text-black"
    >
      <select
        value={locale}
        aria-label={t("Idioma")}
        title={t(names[locale])}
        onChange={event => {
          const selected = event.currentTarget.value;
          if (isLocale(selected)) setLocale(selected);
        }}
        className="mono-label h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent py-2 pl-2.5 pr-7 text-[0.6875rem] tracking-[0.08em] text-inherit"
      >
        {locales.map(language => (
          <option key={language} value={language} className="bg-white text-black">
            {language.toUpperCase()} — {t(names[language])}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none -ml-6 mr-2 text-xs leading-none"
      >
        ▾
      </span>
    </label>
  );
}
