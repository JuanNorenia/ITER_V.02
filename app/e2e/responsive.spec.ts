import { expect, test, type Page } from "@playwright/test";

const widths = [320, 375, 430, 768, 1024, 1440] as const;
type Locale = "es" | "en" | "fr";

const groupNames: Record<Locale, string> = {
  es: "Idioma",
  en: "Language",
  fr: "Langue",
};
async function setLocale(page: Page, current: Locale, target: Locale) {
  if (current === target) return;
  await page
    .getByRole("combobox", { name: groupNames[current] })
    .selectOption(target);
  await expect(page.locator("html")).toHaveAttribute("lang", target);
}

test("home and contact layouts fit six widths in Spanish, English and French", async ({
  page,
}) => {
  test.setTimeout(30_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/");

  let locale: Locale = "es";
  for (const target of ["es", "en", "fr"] as const) {
    await setLocale(page, locale, target);
    locale = target;
    await page.goto("/#/");

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const metrics = await page.evaluate(() => {
        const selectors = [
          "#top",
          "#top .hero-copy",
          "#top .hero-copy h1",
          "#que-hacemos",
          "#que-hacemos h2",
          "#principios",
          "#principios h2",
          "#metodo",
          "#metodo h2",
          "#que-hacemos [role=listitem]",
          "#principios article",
        ];
        return selectors.map(selector => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) return { selector, missing: true };
          const rect = element.getBoundingClientRect();
          return {
            selector,
            missing: false,
            left: rect.left,
            right: rect.right,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          };
        });
      });
      for (const item of metrics) {
        expect(item.missing, `${target} ${width}px ${item.selector}`).toBe(false);
        if (item.missing) continue;
        expect(item.left, `${target} ${width}px ${item.selector} left`).toBeGreaterThanOrEqual(-1);
        expect(item.right, `${target} ${width}px ${item.selector} right`).toBeLessThanOrEqual(width + 1);
        expect(
          item.scrollWidth,
          `${target} ${width}px ${item.selector} horizontal overflow`
        ).toBeLessThanOrEqual(item.clientWidth + 1);
      }

      const figureMetrics = await page.locator("figure").evaluateAll(figures =>
        figures.map(figure => {
          const caption = figure.querySelector("figcaption");
          const figureRect = figure.getBoundingClientRect();
          const captionRect = caption?.getBoundingClientRect();
          return {
            figureLeft: figureRect.left,
            figureRight: figureRect.right,
            captionLeft: captionRect?.left ?? Number.NaN,
            captionRight: captionRect?.right ?? Number.NaN,
            captionWidth: caption?.clientWidth ?? 0,
            captionScrollWidth: caption?.scrollWidth ?? Number.POSITIVE_INFINITY,
          };
        })
      );
      expect(figureMetrics).toHaveLength(2);
      for (const figure of figureMetrics) {
        expect(figure.figureLeft).toBeGreaterThanOrEqual(-1);
        expect(figure.figureRight).toBeLessThanOrEqual(width + 1);
        expect(figure.captionLeft).toBeGreaterThanOrEqual(figure.figureLeft - 1);
        expect(figure.captionRight).toBeLessThanOrEqual(figure.figureRight + 1);
        expect(figure.captionScrollWidth).toBeLessThanOrEqual(
          figure.captionWidth + 1
        );
      }

      const figureFootnote = page.locator("#top figure + p");
      await expect(figureFootnote).toContainText("Fig. 01");
      const footnoteFitsArtColumn = await figureFootnote.evaluate(element => {
        const column = element.parentElement;
        const figure = element.previousElementSibling;
        if (!column || !figure) return false;
        const note = element.getBoundingClientRect();
        const bounds = column.getBoundingClientRect();
        const figureBounds = figure.getBoundingClientRect();
        return (
          note.left >= bounds.left - 1 &&
          note.right <= bounds.right + 1 &&
          note.top >= figureBounds.bottom - 1 &&
          element.scrollWidth <= element.clientWidth + 1
        );
      });
      expect(footnoteFitsArtColumn).toBe(true);

      const heroGeometry = await page.evaluate(() => {
        const copy = document.querySelector("#top .hero-copy");
        const figure = document.querySelector("#top figure");
        const lines = Array.from(
          document.querySelectorAll<HTMLElement>("#top .hero-copy h1 .rv-line > span")
        ).map(element => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const rects = Array.from(range.getClientRects());
          return rects.map(rect => ({
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          }));
        });
        const copyRect = copy?.getBoundingClientRect();
        const figureRect = figure?.getBoundingClientRect();
        return {
          lines,
          copyLeft: copyRect?.left ?? Number.NaN,
          copyRight: copyRect?.right ?? Number.NaN,
          figureLeft: figureRect?.left ?? Number.NaN,
        };
      });
      expect(heroGeometry.lines).toHaveLength(3);
      const firstLine = heroGeometry.lines[0];
      const secondLine = heroGeometry.lines[1];
      expect(firstLine.length).toBeGreaterThan(0);
      expect(secondLine.length).toBeGreaterThan(0);
      expect(secondLine[0].top).toBeGreaterThanOrEqual(firstLine.at(-1)!.bottom - 1);
      for (const lineRect of secondLine) {
        expect(lineRect.left).toBeGreaterThanOrEqual(heroGeometry.copyLeft - 1);
        expect(lineRect.right).toBeLessThanOrEqual(heroGeometry.copyRight + 1);
        if (width >= 1024) {
          expect(lineRect.right).toBeLessThanOrEqual(heroGeometry.figureLeft - 1);
        }
      }
      if (width >= 1024) {
        expect(secondLine[0].left).toBeGreaterThan(firstLine[0].left + 10);
      }

      const methodSidebar = page.locator("#metodo > div > div > div").first();
      await expect(methodSidebar).toHaveCSS(
        "position",
        width >= 1024 ? "sticky" : "static"
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width);
    }

    await page.goto("/#/contacto");
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const formMetrics = await page.locator("form").evaluate(form => {
        const rect = form.getBoundingClientRect();
        const fields = Array.from(
          form.querySelectorAll<HTMLElement>(
            'input:not([name="website"]), textarea, select, button'
          )
        ).map(field => {
          const fieldRect = field.getBoundingClientRect();
          return { left: fieldRect.left, right: fieldRect.right };
        });
        return {
          left: rect.left,
          right: rect.right,
          clientWidth: form.clientWidth,
          scrollWidth: form.scrollWidth,
          fields,
        };
      });
      expect(formMetrics.left).toBeGreaterThanOrEqual(-1);
      expect(formMetrics.right).toBeLessThanOrEqual(width + 1);
      expect(formMetrics.scrollWidth).toBeLessThanOrEqual(
        formMetrics.clientWidth + 1
      );
      for (const field of formMetrics.fields) {
        expect(field.left).toBeGreaterThanOrEqual(formMetrics.left - 1);
        expect(field.right).toBeLessThanOrEqual(formMetrics.right + 1);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width);
    }
  }
});
