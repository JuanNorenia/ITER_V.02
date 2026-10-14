import { describe, expect, it } from "vitest";
import {
  BUDGET_RANGES,
  NEED_TYPES,
  contactSchema,
} from "../../contracts/contact";
import { validContact } from "./contact.fixture";

describe("contact contract", () => {
  it("preserves the fields, trims text and accepts optional empty fields", () => {
    const result = contactSchema.parse({
      ...validContact(),
      nombre: "  Persona de prueba  ",
      email: " persona@example.com ",
      empresa: "",
      presupuesto: "",
      tipoNecesidad: "",
    });
    expect(result.nombre).toBe("Persona de prueba");
    expect(result.email).toBe("persona@example.com");
    expect(result.empresa).toBe("");
    const { empresa, presupuesto, tipoNecesidad, website, ...required } =
      validContact();
    expect([empresa, presupuesto, tipoNecesidad, website]).toHaveLength(4);
    expect(contactSchema.safeParse(required).success).toBe(true);
  });

  it("accepts all the existing need and budget values", () => {
    for (const { value } of NEED_TYPES) {
      expect(
        contactSchema.safeParse({ ...validContact(), tipoNecesidad: value })
          .success
      ).toBe(true);
    }
    for (const { value } of BUDGET_RANGES) {
      expect(
        contactSchema.safeParse({ ...validContact(), presupuesto: value })
          .success
      ).toBe(true);
    }
  });

  it.each([
    { nombre: "A" },
    { nombre: "a".repeat(81) },
    { nombre: "Persona\nBcc: injected@example.com" },
    { email: "invalid" },
    { email: "a".repeat(110) + "@example.com" },
    { empresa: "a".repeat(121) },
    { empresa: "Proyecto\u0000" },
    { mensaje: "corto" },
    { mensaje: "a".repeat(2001) },
    { mensaje: "Mensaje\u0000no válido" },
    { tipoNecesidad: "invalid" },
    { presupuesto: "invalid" },
    { consentimiento: false },
    { consentimiento: "true" },
    { consentimiento: undefined },
    { website: "https://spam.example" },
    { website: " " },
    { t: 0 },
    { t: -1 },
    { t: 1.5 },
    { t: Infinity },
    { t: Number.MAX_SAFE_INTEGER + 1 },
    { extra: "not allowed" },
  ])("rejects invalid input: %j", invalid => {
    expect(
      contactSchema.safeParse({ ...validContact(), ...invalid }).success
    ).toBe(false);
  });

  it("allows multiline messages and exact maximum lengths", () => {
    expect(
      contactSchema.safeParse({
        ...validContact(),
        nombre: "a".repeat(80),
        empresa: "a".repeat(120),
        mensaje: "a".repeat(1997) + "\n\tA",
      }).success
    ).toBe(true);
  });
});
