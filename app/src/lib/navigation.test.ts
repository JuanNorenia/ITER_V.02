import { describe, expect, it } from "vitest";
import {
  contactPath,
  getHomeSection,
  homeSectionPath,
  homeSections,
} from "./navigation";

describe("home section navigation", () => {
  it("keeps the published home section whitelist", () => {
    expect(homeSections).toEqual([
      "top",
      "friccion",
      "que-hacemos",
      "metodo",
      "principios",
      "para-quien",
      "conversacion",
    ]);
  });

  it.each(homeSections)("creates an in-app home URL for %s", section => {
    expect(homeSectionPath(section)).toBe(`/?section=${section}`);
    expect(getHomeSection(new URLSearchParams({ section }).toString())).toBe(
      section
    );
  });

  it("URL-encodes section values and only resolves whitelisted IDs", () => {
    expect(homeSectionPath("metodo avanzado")).toBe(
      "/?section=metodo%20avanzado"
    );
    expect(getHomeSection("section=metodo%20avanzado")).toBeUndefined();
    expect(getHomeSection("section=desconocida")).toBeUndefined();
    expect(getHomeSection("section=top&section=metodo")).toBe("top");
    expect(getHomeSection("other=metodo")).toBeUndefined();
  });
});

describe("contact navigation", () => {
  it("builds a contact route with an optional need", () => {
    expect(contactPath()).toBe("/contacto");
    expect(contactPath("software")).toBe("/contacto?need=software");
    expect(contactPath("a medida & apoyo")).toBe(
      "/contacto?need=a%20medida%20%26%20apoyo"
    );
  });
});
