import { expect, test } from "@playwright/test";

const homeSections = [
  "top",
  "friccion",
  "que-hacemos",
  "metodo",
  "principios",
  "para-quien",
  "conversacion",
] as const;

test("HashRouter opens home sections inside the hash and rejects unknown IDs", async ({
  page,
}) => {
  for (const section of homeSections) {
    await page.goto(`/#/?section=${section}`);
    expect(new URL(page.url()).hash).toBe(`#/?section=${section}`);
    await expect(page.locator(`#${section}`)).toBeFocused();
  }

  await page.goto("/#/?section=not-a-home-section");
  expect(new URL(page.url()).hash).toBe("#/?section=not-a-home-section");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("contact route is independent and keeps the need query for each service", async ({
  page,
}) => {
  await page.goto("/#/");
  await expect(page.locator("#f-nombre")).toHaveCount(0);

  const needs = ["software", "automatizacion", "digitalizacion", "a-medida"];
  const serviceLinks = page.locator("#que-hacemos [role=listitem]");
  await expect(serviceLinks).toHaveCount(needs.length);

  for (const [index, need] of needs.entries()) {
    await page.goto("/#/");
    await serviceLinks.nth(index).click();
    expect(new URL(page.url()).hash).toBe(`#/contacto?need=${need}`);
    await expect(page.locator("#f-tipo")).toHaveValue(need);
    await expect(
      page.getByRole("heading", { level: 1, name: "Empecemos por el problema." })
    ).toBeVisible();
  }

  await page.goto("/#/contacto");
  await expect(page.locator("#f-nombre")).toBeVisible();
  await expect(page.locator("#f-tipo")).toHaveValue("");
  await expect(page.locator("#main-content h1")).toHaveText(
    "Empecemos por el problema."
  );
});

test("language controls translate accessible names, metadata and persist the choice", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (window.location.origin !== "null") {
      window.localStorage.removeItem("iter:locale");
    }
  });
  await page.goto("/#/");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).toHaveTitle(
    "ITER — Encontramos mejores formas de resolver problemas"
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "es_CO"
  );

  const spanishGroup = page.getByRole("group", { name: "Idioma" });
  for (const [name, code] of [
    ["Español", "ES"],
    ["Inglés", "EN"],
    ["Francés", "FR"],
  ]) {
    await expect(spanishGroup.getByRole("button", { name })).toHaveText(code);
  }
  await expect(spanishGroup.getByRole("button", { name: "Español" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await spanishGroup.getByRole("button", { name: "Inglés" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("ITER — We find better ways to solve problems");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "We design and build technology solutions to simplify processes, automate tasks and solve real problems."
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "en_US"
  );

  const englishGroup = page.getByRole("group", { name: "Language" });
  await expect(englishGroup.getByRole("button", { name: "English" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await englishGroup.getByRole("button", { name: "French" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page).toHaveTitle(
    "ITER — Nous trouvons de meilleures façons de résoudre les problèmes"
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "fr_FR"
  );
  await expect(page.getByRole("group", { name: "Langue" })).toBeVisible();
  await expect(
    page
      .getByRole("group", { name: "Langue" })
      .getByRole("button", { name: "Français" })
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("iter:locale")))
    .toBe("fr");

  await page.goto("/#/contacto");
  await expect(page).toHaveTitle("ITER — Contact");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Dites-nous ce qui se passe. Nous commencerons par le comprendre."
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "fr_FR"
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("group", { name: "Langue" })).toBeVisible();
});

test("mobile menu is inert while closed, keyboard reachable, and closes on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/#/");

  const menu = page.locator("#menu-movil");
  const toggle = page.getByRole("button", { name: "Abrir menú" });
  await expect(toggle).toBeVisible();
  await expect(menu).toHaveAttribute("aria-hidden", "true");
  await expect(menu).toHaveAttribute("inert", "");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toHaveAttribute("aria-hidden", "false");
  await expect(menu).not.toHaveAttribute("inert");
  await expect(menu).toHaveCSS("background-color", "rgb(0, 0, 0)");
  const menuLinks = menu.getByRole("link");
  await expect(menuLinks.first()).toBeFocused();

  const logo = page.getByRole("link", { name: "ITER — volver arriba" });
  await logo.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(menuLinks.last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(logo).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-hidden", "true");
  await expect(menu).toHaveAttribute("inert", "");
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeFocused();
});

test("the header switches from overlay to desktop navigation at 1280px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1279, height: 900 });
  await page.goto("/#/");
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
});
