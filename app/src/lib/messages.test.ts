import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { asciiMessages } from "./asciiMessages";
import { messages, translateMessage } from "./messages";

const sharedCopy = [
  "ITER — volver arriba",
  "Principal",
  "Hablemos ↗",
  "Cerrar menú",
  "Abrir menú",
  "Menú móvil",
  "Qué hacemos",
  "Cómo pensamos",
  "Contacto",
  "Encontramos la forma.",
  "El arte de encontrar la forma.",
  "Pie de página",
  "Índice",
  "Privacidad",
  "Principio",
  "Más funciones no significa mejor producto.",
  "Tecnología con propósito. Complejidad innecesaria,",
  "no.",
  "Colombia",
  "Empecemos por el problema.",
  "Cuéntanos qué está pasando. Nosotros empezamos por entenderlo.",
  "También por correo",
  "Recibido.",
  "Gracias por contarnos qué necesitas. Revisaremos tu mensaje para entender cómo podemos ayudarte.",
  "Tu consulta quedó registrada. Te respondemos al correo que compartiste.",
  "Enviar otra consulta",
  "Sitio web",
  "Nombre *",
  "Correo electrónico *",
  "Empresa o proyecto",
  "Tipo de necesidad",
  "Selecciona una opción",
  "¿Qué necesitas resolver? *",
  "Describe el problema, no la solución. Eso es nuestro trabajo.",
  "Presupuesto estimado",
  "Selecciona un rango",
  "Autorizo el tratamiento de mis datos personales para responder esta solicitud y gestionar el contacto, según la",
  "política de tratamiento de datos",
  "No se pudo enviar",
  "No pudimos enviar tu consulta. Inténtalo de nuevo.",
  "Enviar",
  "Enviando…",
  "Enviar mi consulta ↗",
  "Tus datos se usan únicamente para responder tu solicitud y gestionar el contacto. Ninguna casilla viene marcada por defecto.",
];

const contactOptionsAndErrors = [
  "Software o producto digital",
  "Automatización",
  "Integración de herramientas",
  "Digitalización de procesos",
  "Solución a medida",
  "Todavía no lo tengo claro",
  "Otro",
  "Por definir",
  "Menos de $5 M COP",
  "$5 M – $15 M COP",
  "$15 M – $40 M COP",
  "Más de $40 M COP",
  "Cuéntanos tu nombre (mínimo 2 caracteres).",
  "El nombre es demasiado largo.",
  "Necesitamos un correo para responderte.",
  "Ese correo no parece válido. Revísalo.",
  "El correo es demasiado largo.",
  "El nombre de la empresa es demasiado largo.",
  "Cuéntanos un poco más (mínimo 10 caracteres).",
  "Máximo 2000 caracteres. Lo esencial es suficiente.",
  "Necesitamos tu autorización para tratamiento de datos.",
  "El envío fue demasiado rápido. Inténtalo de nuevo.",
  "Recibimos varios envíos seguidos. Espera unos minutos e inténtalo de nuevo.",
  "El nombre no admite caracteres de control.",
  "La empresa no admite caracteres de control.",
  "El mensaje contiene caracteres de control no permitidos.",
  "El formulario necesita una API configurada para enviar consultas. No se ha enviado tu mensaje. Inténtalo más tarde.",
  "El servicio de contacto no está configurado. No se ha enviado tu consulta. Inténtalo más tarde.",
  "El proveedor tardó demasiado en responder. No pudimos confirmar el envío. Inténtalo de nuevo.",
  "No pudimos confirmar el envío con el proveedor de correo. Inténtalo de nuevo más tarde.",
  "No pudimos confirmar el envío de tu consulta. Inténtalo de nuevo más tarde.",
  "Revisa los datos del formulario e inténtalo de nuevo.",
  "El formulario se envió demasiado rápido o ha caducado. Vuelve a abrirlo e inténtalo de nuevo.",
  "Esta consulta ya se ha enviado o está en proceso. Espera unos minutos antes de repetirla.",
];

const ownedSources = [
  "sections/Header.tsx",
  "sections/Footer.tsx",
  "sections/Contact.tsx",
  "sections/Hero.tsx",
  "sections/Friction.tsx",
  "sections/Services.tsx",
  "sections/Method.tsx",
  "sections/Principles.tsx",
  "sections/Audience.tsx",
  "sections/FinalCta.tsx",
  "components/PrivacyOverlay.tsx",
  "components/ScrollHud.tsx",
  "components/Marquee.tsx",
  "components/Cursor.tsx",
  "components/AsciiStudy.tsx",
  "components/HorseStrip.tsx",
  "components/LanguageSwitcher.tsx",
  "components/SiteLayout.tsx",
  "pages/ContactPage.tsx",
  "pages/Home.tsx",
];

const combinedMessages = { ...messages, ...asciiMessages };

function inspectCopy(path: string) {
  const source = ts.createSourceFile(
    path,
    readFileSync(new URL(`../${path}`, import.meta.url), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const keys: string[] = [];
  const untranslated: string[] = [];
  const technicalLabels = new Set([
    "ITER",
    "Build",
    "Shift",
    "Cut",
    "Re",
    "Loop",
    "F01/24",
    "F01/06",
  ]);
  const visibleAttributes = new Set([
    "aria-label",
    "title",
    "placeholder",
    "data-cursor",
  ]);
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "t" &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      keys.push(node.arguments[0].text);
    }
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      ["title", "text", "label"].includes(node.name.text) &&
      ts.isStringLiteral(node.initializer)
    ) {
      keys.push(node.initializer.text);
    }
    if (ts.isJsxText(node)) {
      const text = node.text.replace(/\s+/g, " ").trim();
      if (/\p{L}/u.test(text) && !technicalLabels.has(text)) {
        untranslated.push(text);
      }
    }
    if (
      ts.isJsxAttribute(node) &&
      visibleAttributes.has(node.name.getText(source)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      untranslated.push(node.initializer.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { keys, untranslated };
}

function expectTranslated(key: string) {
  expect(
    Object.hasOwn(combinedMessages, key),
    `Missing Spanish key: ${key}`
  ).toBe(true);
  expect(translateMessage(key, "en", combinedMessages)).not.toBe(key);
  expect(translateMessage(key, "fr", combinedMessages)).not.toBe(key);
}

describe("ES/EN/FR messages", () => {
  it("preserves every original Spanish key exactly", () => {
    for (const key of Object.keys(messages)) {
      expect(translateMessage(key, "es")).toBe(key);
    }
  });

  it("provides nonempty EN/FR translations for every dictionary entry", () => {
    for (const [key, translations] of Object.entries(messages)) {
      for (const locale of ["en", "fr"] as const) {
        expect(translations[locale].trim(), `${locale}: ${key}`).not.toBe("");
        expect(translateMessage(key, locale)).toBe(translations[locale]);
      }
    }
  });

  it.each(["es", "en", "fr"] as const)(
    "keeps unknown text, brands and graphic tags unchanged in %s",
    locale => {
      for (const text of [
        "",
        "Texto aún no registrado",
        "ITER",
        "BUILD",
        "SHIFT",
        "CUT",
        "RE",
        "S.01",
        "P.01",
        "F01",
        "F01/24",
        "F01/06",
        "Build",
        "Shift",
        "Cut",
        "Re",
        "Loop",
        "toString",
        "constructor",
        "__proto__",
      ]) {
        expect(translateMessage(text, locale)).toBe(text);
      }
    }
  );

  it("covers the existing Header, Footer and Contact copy", () => {
    for (const key of sharedCopy) {
      expect(Object.hasOwn(messages, key), key).toBe(true);
    }
  });

  it("covers all current contact options, validation and public server errors", () => {
    for (const key of contactOptionsAndErrors) expectTranslated(key);
  });

  it("translates the language switcher group and every language name", () => {
    for (const key of ["Idioma", "Español", "Inglés", "Francés"]) {
      expectTranslated(key);
    }
    expect(translateMessage("Idioma", "en", combinedMessages)).toBe(
      "Language"
    );
    expect(translateMessage("Idioma", "fr", combinedMessages)).toBe(
      "Langue"
    );
  });

  it("composes the hero naturally in all three languages", () => {
    const fragments = ["¿Y si no", "tuviera que", "ser así?"];
    const compose = (locale: "es" | "en" | "fr") =>
      fragments.map(text => translateMessage(text, locale)).join(" ");
    expect(compose("es")).toBe("¿Y si no tuviera que ser así?");
    expect(compose("en")).toBe("What if it didn’t have to be this way?");
    expect(compose("fr")).toBe("Et si ça ne devait pas être ainsi ?");
  });

  it("translates existing metadata without changing ITER’s brand", () => {
    expectTranslated("ITER — Encontramos mejores formas de resolver problemas");
    expectTranslated(
      "Diseñamos y construimos soluciones tecnológicas para simplificar procesos, automatizar tareas y resolver problemas reales."
    );
    expect(translateMessage("ITER — Contacto", "fr")).toBe("ITER — Contact");
    expect(translateMessage("ITER — Privacidad", "en")).toBe("ITER — Privacy");
  });

  it("supports the shared ASCII dictionary without translating phase tags", () => {
    for (const [key, translations] of Object.entries(asciiMessages)) {
      expect(translateMessage(key, "es", combinedMessages)).toBe(key);
      expect(translateMessage(key, "en", combinedMessages)).toBe(
        translations.en
      );
      expect(translateMessage(key, "fr", combinedMessages)).toBe(
        translations.fr
      );
    }
    expect(translateMessage("BUILD", "fr", combinedMessages)).toBe("BUILD");
    for (const label of ["Build", "Shift", "Cut", "Re", "Loop", "F01"]) {
      expect(translateMessage(label, "en", combinedMessages)).toBe(label);
      expect(translateMessage(label, "fr", combinedMessages)).toBe(label);
    }
  });

  it.each(ownedSources)("covers rendered and accessible copy in %s", path => {
    const { keys, untranslated } = inspectCopy(path);
    expect(untranslated, "Visible literals must use t()").toEqual([]);
    for (const key of keys) {
      expect(
        Object.hasOwn(combinedMessages, key),
        `Missing translation: ${key}`
      ).toBe(true);
    }
  });
});
