import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isLocale,
  LOCALE_STORAGE_KEY,
  locales,
  readSavedLocale,
} from "./locale";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("locale preference", () => {
  it("exposes the supported locales and storage key", () => {
    expect(locales).toEqual(["es", "en", "fr"]);
    expect(LOCALE_STORAGE_KEY).toBe("iter:locale");
  });

  it.each(["es", "en", "fr"] as const)("accepts %s", locale => {
    expect(isLocale(locale)).toBe(true);
  });

  it.each([undefined, null, "", "en-US", "ES", 1, {}, "de"])(
    "rejects unsupported value %s",
    value => {
      expect(isLocale(value)).toBe(false);
    }
  );

  it.each(["es", "en", "fr"] as const)(
    "reads saved locale %s from localStorage",
    locale => {
      vi.stubGlobal("window", {
        localStorage: { getItem: vi.fn(() => locale) },
      });
      expect(readSavedLocale()).toBe(locale);
    }
  );

  it.each([null, "de", "EN", ""])(
    "falls back to Spanish for an unsupported saved value %s",
    saved => {
      vi.stubGlobal("window", {
        localStorage: { getItem: vi.fn(() => saved) },
      });
      expect(readSavedLocale()).toBe("es");
    }
  );

  it("falls back to Spanish when localStorage is unavailable or throws", () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("storage blocked");
      },
    });
    expect(readSavedLocale()).toBe("es");

    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("storage blocked");
        },
      },
    });
    expect(readSavedLocale()).toBe("es");
  });

  it("falls back to Spanish when window is not defined", () => {
    vi.stubGlobal("window", undefined);
    expect(readSavedLocale()).toBe("es");
  });
});
