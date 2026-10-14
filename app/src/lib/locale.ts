export const locales = ["es", "en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const LOCALE_STORAGE_KEY = "iter:locale";

export function isLocale(value: unknown): value is Locale {
  return locales.some(locale => locale === value);
}

export function readSavedLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(saved) ? saved : "es";
  } catch {
    return "es";
  }
}
