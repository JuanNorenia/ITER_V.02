import { expect, test, type Page } from "@playwright/test";

function collectUnexpectedErrors(page: Page) {
  const errors: string[] = [];
  let pendingFontFailures = 0;
  page.on("requestfailed", request => {
    if (/fonts\.(?:googleapis|gstatic)\.com/u.test(request.url())) {
      pendingFontFailures += 1;
    }
  });
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() !== "error") return;
    const source = message.location().url;
    if (
      /fonts\.(?:googleapis|gstatic)\.com/u.test(source) ||
      /fonts\.(?:googleapis|gstatic)\.com/u.test(message.text())
    ) {
      return;
    }
    if (
      /Failed to load resource/u.test(message.text()) &&
      pendingFontFailures > 0
    ) {
      pendingFontFailures -= 1;
      return;
    }
    errors.push(message.text());
  });
  return errors;
}

async function contactAsciiMetrics(page: Page) {
  const pre = page.locator(".contact-page pre");
  await expect.poll(() => pre.textContent()).toMatch(/[#*+:]/u);
  await expect(pre).toBeVisible();
  const metrics = await pre.evaluate(element => {
    type RGBA = { r: number; g: number; b: number; a: number };
    const parse = (color: string): RGBA => {
      const values = color.match(/[\d.]+/gu)?.map(Number) ?? [];
      return {
        r: values[0] ?? 0,
        g: values[1] ?? 0,
        b: values[2] ?? 0,
        a: values[3] ?? 1,
      };
    };
    const over = (foreground: RGBA, background: RGBA): RGBA => {
      const alpha = foreground.a + background.a * (1 - foreground.a);
      if (!alpha) return { r: 0, g: 0, b: 0, a: 0 };
      return {
        r:
          (foreground.r * foreground.a +
            background.r * background.a * (1 - foreground.a)) /
          alpha,
        g:
          (foreground.g * foreground.a +
            background.g * background.a * (1 - foreground.a)) /
          alpha,
        b:
          (foreground.b * foreground.a +
            background.b * background.a * (1 - foreground.a)) /
          alpha,
        a: alpha,
      };
    };
    const luminance = (color: RGBA) => {
      const channels = [color.r, color.g, color.b].map(channel => {
        const value = channel / 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };

    let foreground = parse(getComputedStyle(element).color);
    for (
      let ancestor = element.parentElement;
      ancestor && foreground.a < 0.999;
      ancestor = ancestor.parentElement
    ) {
      const background = parse(getComputedStyle(ancestor).backgroundColor);
      if (background.a > 0) foreground = over(foreground, background);
    }
    if (foreground.a < 0.999) {
      foreground = over(foreground, { r: 255, g: 255, b: 255, a: 1 });
    }
    const background = { r: 255, g: 255, b: 255, a: 1 };
    const light = Math.max(luminance(foreground), luminance(background));
    const dark = Math.min(luminance(foreground), luminance(background));
    const rect = element.getBoundingClientRect();
    return {
      text: element.textContent ?? "",
      width: rect.width,
      height: rect.height,
      contrast: (light + 0.05) / (dark + 0.05),
    };
  });
  expect(metrics.width).toBeGreaterThan(0);
  expect(metrics.height).toBeGreaterThan(0);
  expect(metrics.text.replace(/\s/gu, "").length).toBeGreaterThan(30);
  expect(metrics.contrast).toBeGreaterThanOrEqual(3);
  return pre;
}

test("home keeps its dark hero accent, red token, dense ASCII, horse and 36s marquee", async ({
  page,
}) => {
  const errors = collectUnexpectedErrors(page);
  await page.goto("/#/");
  await expect(page.locator(".contact-page pre")).toHaveCount(0);

  const thirdHeroLine = page
    .locator("#top .hero-title .rv-line")
    .nth(2)
    .locator("span > span");
  const spanishHeroFontSize = await page
    .locator("#top .hero-title")
    .evaluate(element => getComputedStyle(element).fontSize);
  await expect(thirdHeroLine).toContainText("ser así?");
  await expect(thirdHeroLine).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(thirdHeroLine).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect
    .poll(() => page.locator("#top figure pre").first().textContent())
    .toMatch(/[·:*#+=]/u);

  const heroDensity = await page
    .locator("#top figure pre")
    .first()
    .evaluate(element => {
      const text = element.textContent ?? "";
      return text.replace(/\s/gu, "").length / Math.max(1, text.length);
    });
  expect(heroDensity).toBeGreaterThan(0.25);
  await expect(page.locator("figure").nth(1)).toHaveAttribute(
    "aria-label",
    /caballo galopando/u
  );
  await expect
    .poll(() => page.locator("figure").nth(1).locator("pre").last().textContent())
    .toMatch(/#/u);
  await expect(page.locator(".marquee__track").first()).toHaveCSS(
    "animation-duration",
    "36s"
  );
  const marqueeGroups = await page.locator(".marquee").evaluateAll(marquees =>
    marquees.map(marquee => {
      const groups = Array.from(marquee.querySelectorAll<HTMLElement>(".marquee__group"));
      return {
        parentWidth: marquee.clientWidth,
        groups: groups.map(group => group.getBoundingClientRect().width),
      };
    })
  );
  expect(marqueeGroups).toHaveLength(2);
  for (const marquee of marqueeGroups) {
    expect(marquee.groups).toHaveLength(2);
    expect(marquee.groups[0]!).toBeGreaterThanOrEqual(marquee.parentWidth - 1);
    expect(
      Math.abs(marquee.groups[0]! - marquee.groups[1]!)
    ).toBeLessThanOrEqual(1);
  }
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--red").trim()
    )
  ).toBe("#e2251b");

  await page.getByRole("combobox", { name: "Idioma" }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const englishHeroFontSize = await page
    .locator("#top .hero-title")
    .evaluate(element => getComputedStyle(element).fontSize);
  expect(englishHeroFontSize).toBe(spanishHeroFontSize);
  await expect(page.locator("#top .hero-title")).toContainText(
    "What if it didn’t have to be this way?"
  );
  await expect(thirdHeroLine).toContainText("be this way?");
  await expect(thirdHeroLine).toHaveCSS("background-color", "rgb(0, 0, 0)");
  const englishAccentGeometry = await thirdHeroLine.evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return {
      lineCount: range.getClientRects().length,
      accentWidth: element.getBoundingClientRect().width,
      columnWidth: element.parentElement?.parentElement?.getBoundingClientRect().width ?? 0,
    };
  });
  expect(englishAccentGeometry.lineCount).toBe(1);
  expect(englishAccentGeometry.accentWidth).toBeLessThan(
    englishAccentGeometry.columnWidth
  );

  await page.getByRole("combobox", { name: "Language" }).selectOption("fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  const frenchHeroFontSize = await page
    .locator("#top .hero-title")
    .evaluate(element => getComputedStyle(element).fontSize);
  expect(frenchHeroFontSize).toBe(spanishHeroFontSize);
  await page.getByRole("combobox", { name: "Langue" }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.goto("/#/contacto");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Let’s start with the problem."
  );
  expect(errors).toEqual([]);
});

test("fine-pointer cursor keeps 12px, 40px and 72px square states with its label", async ({
  page,
}) => {
  await page.goto("/#/");
  await page.mouse.move(10, 90);
  const box = page.locator(".iter-cursor__box");
  await expect(box).toHaveCSS("width", "12px");
  await expect(box).toHaveCSS("height", "12px");

  const labelledButton = page.locator("#top a[data-cursor]").first();
  await labelledButton.hover();
  await expect(box).toHaveCSS("width", "72px");
  await expect(box).toHaveCSS("height", "72px");
  await expect(page.locator(".iter-cursor__label")).toHaveText("Hablemos");
  await expect(page.locator(".iter-cursor__label")).toHaveCSS("opacity", "1");
  const labelIsInsideCursor = await box.evaluate(boxElement => {
    const label = boxElement.querySelector(".iter-cursor__label");
    if (!label) return false;
    const outer = boxElement.getBoundingClientRect();
    const inner = label.getBoundingClientRect();
    return (
      inner.left >= outer.left &&
      inner.right <= outer.right &&
      inner.top >= outer.top &&
      inner.bottom <= outer.bottom
    );
  });
  expect(labelIsInsideCursor).toBe(true);

  await page
    .getByRole("navigation", { name: "Principal" })
    .getByRole("link")
    .first()
    .hover();
  await expect(box).toHaveCSS("width", "40px");
  await expect(box).toHaveCSS("height", "40px");
});

test("contact ASCII follows a desktop pointer and stays visible on touch and reduced motion", async ({
  browser,
  page,
}) => {
  await page.goto("/#/contacto");
  const desktopField = await contactAsciiMetrics(page);
  const contactBounds = await page.locator(".contact-page").boundingBox();
  expect(contactBounds).not.toBeNull();
  const initial = await desktopField.textContent();
  await page.mouse.move(30, 200);
  await expect
    .poll(() => desktopField.textContent(), { timeout: 2_000 })
    .not.toBe(initial);
  const firstPointerFrame = await desktopField.textContent();
  await page.mouse.move(Math.min(1_300, contactBounds!.width - 20), 500);
  await expect
    .poll(() => desktopField.textContent(), { timeout: 2_000 })
    .not.toBe(firstPointerFrame);

  const touchContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  try {
    const touchPage = await touchContext.newPage();
    await touchPage.goto("http://127.0.0.1:3100/#/contacto");
    const field = await contactAsciiMetrics(touchPage);
    const remainsStatic = await field.evaluate(async element => {
      const original = element.textContent;
      for (let frame = 0; frame < 5; frame++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }
      return element.textContent === original;
    });
    expect(remainsStatic).toBe(true);
    await expect(touchPage.locator(".iter-cursor")).toHaveCount(0);
    expect(
      await touchPage.evaluate(() =>
        document.documentElement.classList.contains("has-cursor")
      )
    ).toBe(false);
    expect(
      await touchPage
        .locator("a")
        .first()
        .evaluate(element => getComputedStyle(element).cursor)
    ).not.toBe("none");
  } finally {
    await touchContext.close();
  }

  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  try {
    const reducedPage = await reducedContext.newPage();
    await reducedPage.goto("http://127.0.0.1:3100/#/contacto");
    const field = await contactAsciiMetrics(reducedPage);
    const remainsStatic = await field.evaluate(async element => {
      const original = element.textContent;
      for (let frame = 0; frame < 5; frame++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }
      return element.textContent === original;
    });
    expect(remainsStatic).toBe(true);
    await expect(reducedPage.locator(".iter-cursor")).toHaveCount(0);
    expect(
      await reducedPage
        .locator("a")
        .first()
        .evaluate(element => getComputedStyle(element).cursor)
    ).not.toBe("none");
    await expect(reducedPage.locator(".marquee__track").first()).toHaveCSS(
      "animation-name",
      "none"
    );
  } finally {
    await reducedContext.close();
  }
});
