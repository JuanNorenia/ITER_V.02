# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> validation, real unconfigured backend response, values preserved
- Location: e2e\landing.spec.ts:66:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 503
Received: 500
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Ir al contenido" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "ITER — volver arriba" [ref=e6] [cursor=pointer]:
        - /url: "#/"
        - text: ITER
      - navigation "Principal" [ref=e7]:
        - link "01 Qué hacemos" [ref=e8] [cursor=pointer]:
          - /url: "#/?section=que-hacemos"
          - generic [ref=e9]: "01"
          - text: Qué hacemos
        - link "02 Cómo pensamos" [ref=e10] [cursor=pointer]:
          - /url: "#/?section=metodo"
          - generic [ref=e11]: "02"
          - text: Cómo pensamos
        - link "03 Contacto" [ref=e12] [cursor=pointer]:
          - /url: "#/contacto"
          - generic [ref=e13]: "03"
          - text: Contacto
        - link "Hablemos ↗" [ref=e14] [cursor=pointer]:
          - /url: "#/contacto"
      - generic [ref=e16]:
        - generic [ref=e17]: Cambiar idioma
        - combobox "Cambiar idioma" [ref=e18]:
          - option "ES — Español" [selected]
          - option "EN — English"
          - option "FR — Français"
  - main [ref=e19]:
    - region [ref=e20]:
      - generic [aria-hidden]:
        - generic [aria-hidden]: ". . . . . .. . . . .. .. . . .. . . . . . . .... . . . . . . . . . . . . .. ... . . . . . . . . . . . . . . . . . . . . . . . . . . . . .. . .. .. . . . . . . . .. ... . . .. . . . . . . . . .. . .. ... . .. .. . . . ..... . . .. . . . . . .. ... .. .. . . . . . . ... . . .. ... . . . . . . .. . .. . ... . . . . . . . . .. . ... . . . .. . . . . . . .. . . . . . ... . . .. .. .. . . . . .. . . . . . . .. . . . . . . . . . .. . . . . . . . . . . . . ..... . . .. . .. . . . . .. .. . .. .. . . . . .. .. . . . . . . . .. . . . . .. .. . . . . . . . . . . . ... . .. . . ... . . . . .. . ... . . . . . . .. . . . . . . . .. .:::---============---:::.. . ... .. . . . . . ... . . . .. .. . . . ..:-==++**###%%%%@@@@@%%%%%###**++=--:. . . .. .. . . . .. . . ... ... . .. . . .:-=+**#%%@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#**+=-:. . .. . . . . . . . . . .... . . .:-=+*#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%#*+=-: .. . .. . . . . . . . . . ..-=+*#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#*+=:. . . . . . . . . ..-=+*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#+=-: . . . . . . . . . .:-+*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#*=-. . . .. .. . . . ... . . .:=+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#+=:.. . . . . . . . . . .. . .-=*#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*+-: . ... . . . . ..:=*#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#+=: . . ... . ... . . :-+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+=: . .. .. .. . . ..-=*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+=:. . . .. . .. . . .-+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-. . . . . . .:=+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*=-. . . . . :=*#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-: . . . . .. . . :=*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*=: .. . . . :-+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%#+-.. . .. . . . . .-+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-.. . . :=*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-. . . . . . ..-+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-. . . . .. . :=*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*=-. . . . . . . .-+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*=: . .. . . . .-+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-... .... . . . .-+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*=:.. . . . . . . .-+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-.. . . . . . . ...-+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*=:... . . . . .. . . . . . .:=*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*+-. .. . . . . . . .:-+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+-. . . ... . . .. . .. .-=*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%@@@@@@@@#+=:.: .. . . . .. . .. . . ..-+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%%%%%*=:.:.... . . . . :=+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%*=:...:...... . . . . . .:=+#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*=-:..:......... .. . . . .. . :=+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*=-:::.:..:..:..... .. . . . .-+*%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*=--:::::............ .. ...:=+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%%%%###########%%*=-:::::-:::.:.......:. . . . . .-=+#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%#################*=---:::-:::::...:....... . .. . .. . . ..-=+*#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%%##################*=-----:-::::::::..::....... . . . .. .. ... .:-=+*#%@@@@@@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%###################+-=------:::::::::::....:.... . .. . .. . .. .:-=+*##%@@@@@@@@@@@@@@@@@@@@%%%%%%%%%%%%%%###################+----=------::::::::..:...::::.. . . . . .::-=++**#%%%@@@@@@@@@@@@@%%%%%%%%%%%%%##############@@@@*=-=----=-----:::--::::.:.:...:.. . . . . . .. . . .. .::--==+++****#########%%%%%%%%%%############@@@@@@@@@@===-=--------:::::::..:..:...:. . . . .. . . . . ....::::--------===============++++++++@@@@@@@@@@@=-===------::-:::::.:.:::..... . ... . . . . . .. . . ........:.:::::--:-----------=@@@@@@@@@@=--=--=-----::::::::.......... . .. .. . . . .. . . . . . ..:.:..:..:.:::-:::::----=-=----=@@@@@@@@=-=-==-=-----:::::::::.:..:::.: . .. . . ..........::::-:-:-----=--------====---=-----------:::::::::.::....... .. . . . . ... . . . ..::..::..:::-::-::------==-=------------=-------:-:::::::....:...:. . . . .. . . .. . . ... . . ..:....:..:::-:::-::------=-------===---------::::::-::::........... . . . . . . .. .. . . . . ::.........::::-:::::-----------------------:-::--:::::.:......:.. . . . . . . ... . . . .. ............::::::-:::::----------------:---:::-:-::........:... . . . . .. .. . . . ...:........::::::::-:--::::::::--::-:::::-::::::.......:.... . . . . . . .. . . . . .. ::..::.......::::::::::-----::::-::::-:-::::::..:......... . . . .. . . . .. .. ... . :.:..:..:..:..:::::::::::-:-::::::::::::...:........:.. ... . . . . .. . . . . ...::.:..:.......:::::::::::::::::...:.:..:::....:.. . . .. . . . . .. . . :::...::......:...:.:........:...............:. . . . ."
      - generic [ref=e21]:
        - link "← Volver al inicio" [ref=e22] [cursor=pointer]:
          - /url: "#/"
        - generic [ref=e23]:
          - generic [ref=e24]:
            - paragraph [ref=e25]: ITER / Contacto
            - heading "Empecemos por el problema." [level=1] [ref=e26]
            - paragraph [ref=e27]: Cuéntanos qué está pasando. Nosotros empezamos por entenderlo.
            - paragraph [ref=e28]: Una conversación. Una forma de empezar.
          - generic [ref=e30]:
            - paragraph [ref=e31]: Los campos con * son obligatorios.
            - group "Contacto" [ref=e32]:
              - generic [ref=e34]:
                - generic [ref=e35]:
                  - text: Nombre *
                  - textbox "Nombre *" [ref=e36]: Prueba local
                - generic [ref=e37]:
                  - text: Correo electrónico *
                  - textbox "Correo electrónico *" [ref=e38]: test@example.com
                - generic [ref=e39]:
                  - text: Empresa o proyecto
                  - textbox "Empresa o proyecto" [ref=e40]
              - generic [ref=e41]:
                - text: Tipo de necesidad
                - combobox "Tipo de necesidad" [ref=e42]:
                  - option "Selecciona una opción" [selected]
                  - option "Software o producto digital"
                  - option "Automatización"
                  - option "Integración de herramientas"
                  - option "Digitalización de procesos"
                  - option "Solución a medida"
                  - option "Todavía no lo tengo claro"
                  - option "Otro"
              - generic [ref=e43]:
                - text: ¿Qué necesitas resolver? *
                - textbox "¿Qué necesitas resolver? *" [ref=e44]:
                  - /placeholder: Describe el problema, no la solución. Eso es nuestro trabajo.
                  - text: Necesitamos simplificar un proceso manual.
              - generic [ref=e45]:
                - text: Presupuesto estimado
                - combobox "Presupuesto estimado" [ref=e46]:
                  - option "Selecciona un rango" [selected]
                  - option "Por definir"
                  - option "Menos de $5 M COP"
                  - option "$5 M – $15 M COP"
                  - option "$15 M – $40 M COP"
                  - option "Más de $40 M COP"
              - generic [ref=e48]:
                - checkbox "Autorizo el tratamiento de mis datos personales para responder esta solicitud y gestionar el contacto, según la" [checked] [ref=e49]
                - generic [ref=e50]:
                  - generic [ref=e51]: Autorizo el tratamiento de mis datos personales para responder esta solicitud y gestionar el contacto, según la
                  - link "política de tratamiento de datos" [ref=e52] [cursor=pointer]:
                    - /url: "#/privacidad"
                  - text: . *
            - alert [ref=e53]:
              - paragraph [ref=e54]: No se pudo enviar
              - paragraph [ref=e55]: No pudimos confirmar el envío. Tus datos siguen en el formulario para que puedas intentarlo de nuevo.
            - button "Enviar mi consulta ↗" [ref=e56] [cursor=pointer]
            - paragraph [ref=e57]: Tus datos se usan únicamente para responder tu solicitud y gestionar el contacto. Ninguna casilla viene marcada por defecto.
  - contentinfo [ref=e58]:
    - generic [ref=e59]:
      - generic [ref=e60]:
        - paragraph [aria-hidden] [ref=e61]: ITER.
        - paragraph [ref=e62]: Encontramos la forma.
      - navigation "Pie de página" [ref=e63]:
        - paragraph [ref=e64]: Índice
        - link "Qué hacemos" [ref=e65] [cursor=pointer]:
          - /url: "#/?section=que-hacemos"
        - link "Cómo pensamos" [ref=e66] [cursor=pointer]:
          - /url: "#/?section=metodo"
        - link "Contacto" [ref=e67] [cursor=pointer]:
          - /url: "#/contacto"
        - link "Privacidad" [ref=e68] [cursor=pointer]:
          - /url: "#/privacidad"
      - generic [ref=e69]:
        - paragraph [ref=e70]: Principio
        - paragraph [ref=e71]: El arte de encontrar la forma.
        - paragraph [ref=e72]: Más funciones no significa mejor producto.
    - generic [ref=e73]:
      - paragraph [ref=e74]: Tecnología con propósito. Complejidad innecesaria, no.
      - paragraph [ref=e75]: © 2026 ITER — Colombia
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | 
  3   | async function chooseLocale(page: Page, locale: string) {
  4   |   await page.locator("#language").selectOption(locale);
  5   |   await expect(page.locator("html")).toHaveAttribute("lang", locale);
  6   | }
  7   | 
  8   | async function assertLayout(page: Page) {
  9   |   const issues = await page.evaluate(() => {
  10  |     const viewport = document.documentElement.clientWidth;
  11  |     const errors: string[] = [];
  12  |     if (document.documentElement.scrollWidth > viewport + 1) errors.push(`Page overflow: ${document.documentElement.scrollWidth}/${viewport}`);
  13  |     document.querySelectorAll<HTMLElement>("h1, h2, h3, figcaption, form input:not([type=checkbox]), form textarea, form select").forEach(element => {
  14  |       const rect = element.getBoundingClientRect();
  15  |       if (rect.width && (rect.left < -1 || rect.right > viewport + 1)) errors.push(`${element.tagName}: ${element.textContent?.slice(0, 60)} is out of bounds (${rect.left}, ${rect.right})`);
  16  |     });
  17  |     return errors;
  18  |   });
  19  |   expect(issues).toEqual([]);
  20  | }
  21  | 
  22  | for (const width of [320, 375, 430, 768, 1024, 1440]) {
  23  |   for (const locale of ["es", "en", "fr"]) {
  24  |     test(`responsive ${width}px ${locale}: home and contact`, async ({ page }) => {
  25  |       await page.setViewportSize({ width, height: 900 });
  26  |       await page.emulateMedia({ reducedMotion: "reduce" });
  27  |       const errors: string[] = [];
  28  |       page.on("pageerror", error => errors.push(error.message));
  29  |       page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  30  |       await page.goto("/#/");
  31  |       await chooseLocale(page, locale);
  32  |       await expect(page.locator("h1")).toHaveCount(1);
  33  |       await expect(page.locator("main form")).toHaveCount(0);
  34  |       await expect(page.locator("main section")).toHaveCount(7);
  35  |       await assertLayout(page);
  36  |       const hero = page.locator("h1");
  37  |       const figure = page.locator("#top figure");
  38  |       const a = await hero.boundingBox();
  39  |       const b = await figure.boundingBox();
  40  |       expect(a && b && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y).toBe(false);
  41  |       await page.goto("/#/contacto");
  42  |       await expect(page.locator("html")).toHaveAttribute("lang", locale);
  43  |       await expect(page.locator("h1")).toHaveCount(1);
  44  |       await expect(page.locator("form")).toBeVisible();
  45  |       await expect(page.locator("#f-consent")).not.toBeChecked();
  46  |       await assertLayout(page);
  47  |       expect(errors).toEqual([]);
  48  |     });
  49  |   }
  50  | }
  51  | 
  52  | test("contact navigation, preselection and cross-page anchors", async ({ page }) => {
  53  |   await page.emulateMedia({ reducedMotion: "reduce" });
  54  |   await page.goto("/#/");
  55  |   await page.locator('a[href="#/contacto?need=software"]').click();
  56  |   await expect(page).toHaveURL(/#\/contacto\?need=software/);
  57  |   await expect(page.locator("#f-tipo")).toHaveValue("software");
  58  |   await page.locator('footer a[href="#/?section=metodo"]').click();
  59  |   await expect(page).toHaveURL(/section=metodo/);
  60  |   await expect(page.locator("#metodo")).toBeFocused();
  61  |   const top = await page.locator("#metodo").evaluate(element => element.getBoundingClientRect().top);
  62  |   expect(top).toBeGreaterThanOrEqual(63);
  63  |   expect(top).toBeLessThan(100);
  64  | });
  65  | 
  66  | test("validation, real unconfigured backend response, values preserved", async ({ page }) => {
  67  |   await page.goto("/#/contacto");
  68  |   await page.getByRole("button", { name: "Enviar mi consulta ↗" }).click();
  69  |   await expect(page.locator("#f-nombre")).toBeFocused();
  70  |   await expect(page.locator("#error-email")).toBeVisible();
  71  |   await page.locator("#f-nombre").fill("Prueba local");
  72  |   await page.locator("#f-email").fill("invalid");
  73  |   await page.locator("#f-mensaje").fill("Necesitamos simplificar un proceso manual.");
  74  |   await page.locator("#f-consent").check();
  75  |   await page.getByRole("button", { name: "Enviar mi consulta ↗" }).click();
  76  |   await expect(page.locator("#error-email")).toContainText("Ese correo no parece válido");
  77  |   await page.locator("#f-email").fill("test@example.com");
  78  |   await page.waitForTimeout(2100);
  79  |   const response = page.waitForResponse(response => response.url().includes("/api/trpc/contact.submit"));
  80  |   await page.getByRole("button", { name: "Enviar mi consulta ↗" }).click();
> 81  |   expect((await response).status()).toBe(503);
      |                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  82  |   await expect(page.getByRole("alert")).toContainText("no está configurado");
  83  |   await expect(page.locator("#f-nombre")).toHaveValue("Prueba local");
  84  |   await expect(page.getByText("Recibido.", { exact: true })).toHaveCount(0);
  85  | });
  86  | 
  87  | test("confirmed success and duplicate submit guard (mocked provider response)", async ({ page }) => {
  88  |   let requests = 0;
  89  |   await page.route("**/api/trpc/contact.submit*", async route => {
  90  |     requests++;
  91  |     await new Promise(resolve => setTimeout(resolve, 300));
  92  |     await route.fulfill({ json: [{ result: { data: { json: { ok: true, forwarded: true } } } }] });
  93  |   });
  94  |   await page.goto("/#/contacto");
  95  |   await page.locator("#f-nombre").fill("Prueba simulada");
  96  |   await page.locator("#f-email").fill("test@example.com");
  97  |   await page.locator("#f-mensaje").fill("Esta prueba no envía ningún correo real.");
  98  |   await page.locator("#f-consent").check();
  99  |   await page.locator("form").evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
  100 |   await expect(page.getByRole("status")).toContainText("Recibido.");
  101 |   expect(requests).toBe(1);
  102 | });
  103 | 
  104 | test("mobile menu keyboard trap, Escape, and translated privacy", async ({ page }) => {
  105 |   await page.setViewportSize({ width: 375, height: 812 });
  106 |   await page.goto("/#/");
  107 |   await chooseLocale(page, "fr");
  108 |   const open = page.getByRole("button", { name: "Ouvrir le menu" });
  109 |   await open.click();
  110 |   await expect(page.locator("#menu-movil a").first()).toBeFocused();
  111 |   for (let i = 0; i < 8; i++) {
  112 |     await page.keyboard.press("Tab");
  113 |     const contained = await page.evaluate(() => !!document.activeElement?.closest("#menu-movil") || document.activeElement?.getAttribute("aria-controls") === "menu-movil");
  114 |     expect(contained).toBe(true);
  115 |   }
  116 |   await page.keyboard.press("Escape");
  117 |   await expect(open).toBeFocused();
  118 |   await page.locator('footer a[href="#/privacidad"]').click();
  119 |   await expect(page.locator("h1")).toContainText("données personnelles");
  120 |   await expect(page.getByText("Document provisoire — en attente de révision juridique", { exact: true })).toBeVisible();
  121 | });
  122 | 
  123 | test("ASCII reacts to pointer, pauses, and reduced motion is static", async ({ page }) => {
  124 |   await page.goto("/#/");
  125 |   const pre = page.locator("#top figure pre");
  126 |   await expect(pre).not.toBeEmpty();
  127 |   const bounds = await pre.boundingBox();
  128 |   expect(bounds).toBeTruthy();
  129 |   await page.mouse.move(bounds!.x + bounds!.width * 0.4, bounds!.y + bounds!.height * 0.5);
  130 |   await page.waitForTimeout(150);
  131 |   const animated = await pre.textContent();
  132 |   await page.mouse.move(bounds!.x + bounds!.width * 0.7, bounds!.y + bounds!.height * 0.6);
  133 |   await page.waitForTimeout(150);
  134 |   expect(await pre.textContent()).not.toBe(animated);
  135 |   await page.locator("#top").getByRole("button", { name: "Pausar animación" }).click();
  136 |   const paused = await pre.textContent();
  137 |   await page.waitForTimeout(250);
  138 |   expect(await pre.textContent()).toBe(paused);
  139 |   await page.emulateMedia({ reducedMotion: "reduce" });
  140 |   await expect(page.locator(".iter-cursor")).toHaveCount(0);
  141 |   await page.waitForTimeout(100);
  142 |   const staticFrame = await pre.textContent();
  143 |   await page.waitForTimeout(250);
  144 |   expect(await pre.textContent()).toBe(staticFrame);
  145 |   await page.emulateMedia({ reducedMotion: "no-preference" });
  146 |   await page.goto("/#/contacto");
  147 |   const background = page.locator("#contacto pre");
  148 |   const initial = await background.textContent();
  149 |   await page.mouse.move(600, 400);
  150 |   await page.waitForTimeout(180);
  151 |   expect(await background.textContent()).not.toBe(initial);
  152 | });
  153 | 
```