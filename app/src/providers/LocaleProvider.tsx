import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { asciiMessages } from "@/lib/asciiMessages";
import { messages, translateMessage } from "@/lib/messages";
import { LOCALE_STORAGE_KEY, readSavedLocale, type Locale } from "@/lib/locale";

const dictionary = { ...messages, ...asciiMessages };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (text: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readSavedLocale);
  const t = useCallback(
    (text: string) => translateMessage(text, locale, dictionary),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // El sitio sigue funcionando cuando el navegador bloquea el almacenamiento.
    }
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- El hook comparte el contexto con su proveedor.
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale requires LocaleProvider");
  return context;
}
