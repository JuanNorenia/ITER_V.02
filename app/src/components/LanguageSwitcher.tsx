import { locales } from "@/lib/locale";
import { useLocale } from "@/providers/LocaleProvider";

const names = { es: "Español", en: "Inglés", fr: "Francés" } as const;

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div role="group" aria-label={t("Idioma")} className="flex shrink-0">
      {locales.map(language => (
        <button
          key={language}
          type="button"
          onClick={() => setLocale(language)}
          aria-pressed={locale === language}
          aria-label={t(names[language])}
          title={t(names[language])}
          className={`mono-data flex h-11 w-11 items-center justify-center border-b-2 transition-opacity hover:opacity-100 ${
            locale === language ? "border-current" : "border-transparent opacity-60"
          }`}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
