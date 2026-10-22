import { expect, test, type Page } from "@playwright/test";

const pagesBase = "http://127.0.0.1:3101/ITER_V.02/";

async function fillValidContact(page: Page) {
  await page.locator("#f-nombre").fill("Ada ITER");
  await page.locator("#f-email").fill("ada@example.test");
  await page
    .locator("#f-mensaje")
    .fill("Queremos simplificar un proceso interno.");
  await page.locator('input[name="consentimiento"]').check();
}

test("Pages serves prefixed assets and refreshes directly on contact route", async ({
  page,
}) => {
  const localAssetPaths: string[] = [];
  const contactRequests: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if (
      url.origin === "http://127.0.0.1:3101" &&
      url.pathname.includes("/assets/")
    ) {
      localAssetPaths.push(url.pathname);
    }
    if (url.pathname.includes("/api/trpc/contact.submit")) {
      contactRequests.push(request.url());
    }
  });

  await page.goto(`${pagesBase}#/contacto?need=software`);
  await expect(page).toHaveURL(`${pagesBase}#/contacto?need=software`);
  await expect(page.locator("#f-tipo")).toHaveValue("software");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Cuéntanos qué necesita mejorar."
  );
  await page.reload();
  await expect(page).toHaveURL(`${pagesBase}#/contacto?need=software`);
  await expect(page.locator("#f-tipo")).toHaveValue("software");
  await expect.poll(() => localAssetPaths.length).toBeGreaterThan(0);
  expect(
    localAssetPaths.every(path => path.startsWith("/ITER_V.02/assets/"))
  ).toBe(true);

  await fillValidContact(page);
  await page.locator("form button[type=submit]").click();
  await expect(page.getByRole("alert")).toContainText(
    "El formulario necesita una API configurada para enviar consultas. No se ha enviado tu mensaje."
  );
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByText("Recibido.", { exact: true })).toHaveCount(0);
  expect(contactRequests).toEqual([]);
});
