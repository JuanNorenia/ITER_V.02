import { expect, test, type Page } from "@playwright/test";

const apiPath = /\/api\/trpc\/contact\.submit\?batch=1(?:&|$)/u;

async function fillValidContact(page: Page) {
  await page.locator("#f-nombre").fill("Ada ITER");
  await page.locator("#f-email").fill("ada@example.test");
  await page.locator("#f-empresa").fill("ITER Lab");
  await page.locator("#f-tipo").selectOption("software");
  await page
    .locator("#f-mensaje")
    .fill("Queremos simplificar un proceso interno repetitivo.");
  await page.locator("#f-presupuesto").selectOption("5m-15m");
  await page.locator('input[name="consentimiento"]').check();
}

function installErrorCollector(page: Page, allowExpected503 = false) {
  const errors: string[] = [];
  let expectedApi503 = false;
  let pendingFontFailures = 0;
  page.on("requestfailed", request => {
    if (/fonts\.(?:googleapis|gstatic)\.com/u.test(request.url())) {
      pendingFontFailures += 1;
    }
  });
  if (allowExpected503) {
    page.on("response", response => {
      if (apiPath.test(response.url()) && response.status() === 503) {
        expectedApi503 = true;
      }
    });
  }
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() !== "error") return;
    const text = message.text();
    const source = message.location().url;
    if (
      /fonts\.(?:googleapis|gstatic)\.com/u.test(source) ||
      /fonts\.(?:googleapis|gstatic)\.com/u.test(text)
    ) {
      return;
    }
    if (
      expectedApi503 &&
      /\b503\b|Service Unavailable/u.test(text)
    ) {
      expectedApi503 = false;
      return;
    }
    if (/Failed to load resource/u.test(text) && pendingFontFailures > 0) {
      pendingFontFailures -= 1;
      return;
    }
    errors.push(text);
  });
  return errors;
}

test("contact form uses the Spanish field contract and validates required inputs", async ({
  page,
}) => {
  await page.goto("/#/contacto");

  await expect(
    page.getByRole("heading", { level: 1, name: "Empecemos por el problema." })
  ).toBeVisible();
  for (const [id, name] of [
    ["f-nombre", "nombre"],
    ["f-email", "email"],
    ["f-empresa", "empresa"],
    ["f-tipo", "tipoNecesidad"],
    ["f-mensaje", "mensaje"],
    ["f-presupuesto", "presupuesto"],
  ]) {
    await expect(page.locator(`#${id}`)).toHaveAttribute("name", name);
  }
  for (const [label, id] of [
    ["Nombre *", "f-nombre"],
    ["Correo electrónico *", "f-email"],
    ["Empresa o proyecto", "f-empresa"],
    ["Tipo de necesidad", "f-tipo"],
    ["¿Qué necesitas resolver? *", "f-mensaje"],
    ["Presupuesto estimado", "f-presupuesto"],
  ]) {
    await expect(page.getByLabel(label)).toHaveAttribute("id", id);
  }
  const consent = page.locator('input[name="consentimiento"]');
  await expect(consent).toHaveAttribute("type", "checkbox");
  await expect(consent).not.toBeChecked();

  await page.locator("form button[type=submit]").click();
  await expect(page.locator("#f-nombre")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#f-email")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#f-mensaje")).toHaveAttribute("aria-invalid", "true");
  await expect(consent).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toHaveCount(4);
  await expect(page.locator("#e-nombre")).toHaveText(
    "Cuéntanos tu nombre (mínimo 2 caracteres)."
  );
  await expect(page.locator("#e-consent")).toHaveText(
    "Necesitamos tu autorización para tratamiento de datos."
  );
  await expect(page).toHaveURL(/#\/contacto$/u);
});

test("field errors and accessible names are translated in English and French", async ({
  page,
}) => {
  await page.goto("/#/contacto");

  const cases = [
    {
      sourceName: "Idioma",
      target: "en",
      title: "Let’s start with the problem.",
      nameError: "Tell us your name (at least 2 characters).",
      consentError: "We need your consent to process your data.",
    },
    {
      sourceName: "Language",
      target: "fr",
      title: "Commençons par le problème.",
      nameError: "Indiquez votre nom (au moins 2 caractères).",
      consentError: "Nous avons besoin de votre consentement pour traiter vos données.",
    },
  ] as const;

  for (const entry of cases) {
    await page
      .getByRole("combobox", { name: entry.sourceName })
      .selectOption(entry.target);
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      entry.target
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(entry.title);
    await page.locator("form button[type=submit]").click();
    await expect(page.locator("#e-nombre")).toHaveText(entry.nameError);
    await expect(page.locator("#e-consent")).toHaveText(entry.consentError);
  }
});

test("only a confirmed mocked tRPC result shows the received state", async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route(apiPath, async route => {
    const request = route.request();
    requests.push(request.url());
    expect(request.method()).toBe("POST");
    expect(request.headers()["content-type"]).toContain("application/json");
    const body = request.postDataJSON() as Record<
      string,
      { json?: Record<string, unknown> }
    >;
    expect(body["0"]?.json).toMatchObject({
      nombre: "Ada ITER",
      email: "ada@example.test",
      empresa: "ITER Lab",
      tipoNecesidad: "software",
      presupuesto: "5m-15m",
      consentimiento: true,
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { result: { data: { json: { ok: true, forwarded: true } } } },
      ]),
    });
  });

  await page.goto("/#/contacto");
  await fillValidContact(page);
  await page.locator("form button[type=submit]").click();

  await expect(page.getByRole("status")).toContainText("Recibido.");
  await expect(page.locator("form")).toHaveCount(0);
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatch(/\/api\/trpc\/contact\.submit\?batch=1/u);
  expect(await page.evaluate(() => Object.keys(localStorage))).not.toContain(
    "nombre"
  );
});

test("false or missing provider confirmation keeps values and never says Received", async ({
  page,
}) => {
  for (const response of [{ ok: true, forwarded: false }, { ok: false }]) {
    await page.unrouteAll();
    await page.route(apiPath, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ result: { data: { json: response } } }]),
      });
    });
    await page.goto("/#/contacto");
    await fillValidContact(page);
    await page.locator("form button[type=submit]").click();

    await expect(page.getByRole("alert")).toContainText("No se pudo enviar");
    await expect(page.locator("#f-nombre")).toHaveValue("Ada ITER");
    await expect(page.locator("#f-email")).toHaveValue("ada@example.test");
    await expect(page.locator("#f-mensaje")).toHaveValue(
      "Queremos simplificar un proceso interno repetitivo."
    );
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.getByText("Recibido.", { exact: true })).toHaveCount(0);
    const storedKeys = await page.evaluate(() => Object.keys(localStorage));
    for (const field of ["nombre", "email", "empresa", "tipoNecesidad", "mensaje", "presupuesto"]) {
      expect(storedKeys).not.toContain(field);
    }
  }
});

test("an unavailable local API gives an honest 503 and retains form data", async ({
  page,
}) => {
  const errors = installErrorCollector(page, true);
  await page.addInitScript(() => {
    const realNow = Date.now.bind(Date);
    Date.now = () => realNow() - 3_000;
  });
  await page.goto("/#/contacto");
  await fillValidContact(page);

  const response = page.waitForResponse(
    result =>
      apiPath.test(result.url()) && result.status() === 503,
    { timeout: 10_000 }
  );
  await page.locator("form button[type=submit]").click();
  await response;

  await expect(page.getByRole("alert")).toContainText(
    "El servicio de contacto no está configurado. No se ha enviado tu consulta."
  );
  await expect(page.locator("#f-nombre")).toHaveValue("Ada ITER");
  await expect(page.locator("#f-email")).toHaveValue("ada@example.test");
  await expect(page.locator("#f-mensaje")).toHaveValue(
    "Queremos simplificar un proceso interno repetitivo."
  );
  await expect(page.getByRole("status")).toHaveCount(0);
  expect(errors).toEqual([]);
});
