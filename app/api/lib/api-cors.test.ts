import { describe, expect, it } from "vitest";
import { getAllowedOrigins, parseAllowedOrigins } from "./api-cors";

describe("API origin allowlist", () => {
  it("normalizes exact origins and supports an empty allowlist", () => {
    expect([
      ...parseAllowedOrigins(
        " https://Pages.example/, http://localhost:5173, https://pages.example "
      ),
    ]).toEqual(["https://pages.example", "http://localhost:5173"]);
    expect(parseAllowedOrigins("").size).toBe(0);
  });

  it("does not expand wildcard-looking hostnames into subdomain permissions", () => {
    const origins = parseAllowedOrigins("https://*.example.com");
    expect(origins.has("https://pages.example.com")).toBe(false);
  });

  it("always permits exact ITER production origins alongside configured origins", () => {
    const origins = getAllowedOrigins("https://pages.example");
    expect(origins.has("https://itercol.com")).toBe(true);
    expect(origins.has("https://www.itercol.com")).toBe(true);
    expect(origins.has("https://pages.example")).toBe(true);
    expect(origins.has("https://evil.itercol.com")).toBe(false);
  });

  it.each([
    "*",
    "not a URL",
    "null",
    "file:///tmp/site",
    "https://user:secret@example.com",
    "https://pages.example/repository/",
    "https://pages.example?secret=value",
    "https://pages.example#fragment",
  ])("fails closed for invalid configuration (%#)", value => {
    expect(() => parseAllowedOrigins(value)).toThrow("ALLOWED_ORIGINS");
  });
});
