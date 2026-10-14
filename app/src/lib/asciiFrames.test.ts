import { describe, expect, it } from "vitest";
import { fitAsciiGrid, idleAsciiPointer } from "./asciiGrid";
import type { AsciiGrid } from "./asciiGrid";
import { horseCycleRate, renderAsciiHorse } from "./asciiHorse";
import { asciiPhaseAt, renderAsciiStudy } from "./asciiStudy";

const sizes = [
  [320, 260, 72],
  [360, 320, 72],
  [768, 400, 96],
  [1440, 480, 164],
];

function expectGrid(text: string, grid: AsciiGrid) {
  const lines = text.split("\n");
  expect(lines).toHaveLength(grid.rows);
  lines.forEach(line => expect(line).toHaveLength(grid.cols));
  expect(text).toMatch(/^[\x20-\x7e\n]+$/);
}

function inkBounds(text: string) {
  const cells = text
    .split("\n")
    .flatMap((line, y) =>
      [...line].flatMap((char, x) => (char !== " " ? [{ x, y }] : []))
    );
  return {
    left: Math.min(...cells.map(cell => cell.x)),
    right: Math.max(...cells.map(cell => cell.x)),
    top: Math.min(...cells.map(cell => cell.y)),
    bottom: Math.max(...cells.map(cell => cell.y)),
  };
}

function difference(a: string, b: string) {
  return [...a].reduce(
    (sum, char, index) => sum + Number(char !== b[index]),
    0
  );
}

describe("measured ASCII grid", () => {
  it.each(sizes)(
    "fits %ipx × %ipx without overflowing",
    (width, height, cols) => {
      const grid = fitAsciiGrid(width, height, 0.61, cols);
      expect(grid.width).toBeLessThan(width);
      expect(grid.height).toBeLessThan(height);
      expect(grid.rows).toBeLessThanOrEqual(72);
      expect(grid.cols).toBeGreaterThan(40);
    }
  );

  it("uses glyph metrics and bounds density on tall backgrounds", () => {
    const narrowGlyphs = fitAsciiGrid(320, 1500, 0.52, 58);
    const wideGlyphs = fitAsciiGrid(320, 1500, 0.76, 58);
    expect(narrowGlyphs.rows).toBeLessThanOrEqual(72);
    expect(wideGlyphs.rows).toBeLessThanOrEqual(72);
    expect(narrowGlyphs.cols).not.toBe(wideGlyphs.cols);
    expect(wideGlyphs.width).toBeLessThan(320);
  });
});

describe("BUILD / SHIFT / CUT field", () => {
  it.each(sizes)(
    "renders printable ASCII at %ipx × %ipx",
    (width, height, cols) => {
      const grid = fitAsciiGrid(width, height, 0.61, cols);
      expectGrid(renderAsciiStudy(grid, 0.42, idleAsciiPointer), grid);
    }
  );

  it("has a visible first/static frame and deterministic phases", () => {
    const grid = fitAsciiGrid(480, 320, 0.61, 64);
    const frame = renderAsciiStudy(grid, 0.42, idleAsciiPointer);
    expect(frame).toMatch(/[@#%]/);
    expect(renderAsciiStudy(grid, 0.42, idleAsciiPointer)).toBe(frame);
    expect(asciiPhaseAt(0.12)).toBe("BUILD");
    expect(asciiPhaseAt(0.42)).toBe("SHIFT");
    expect(asciiPhaseAt(0.72)).toBe("CUT");
    expect(asciiPhaseAt(0.92)).toBe("RE");
    expect(asciiPhaseAt(1.42)).toBe("SHIFT");
  });

  it("reacts on the first cursor sample, including blank and solid regions", () => {
    const grid = fitAsciiGrid(480, 320, 0.61, 64);
    const frame = renderAsciiStudy(grid, 0.42, idleAsciiPointer);
    for (const x of [-0.8, 0, 0.8]) {
      const reactive = renderAsciiStudy(grid, 0.42, { x, y: 0, strength: 1 });
      expect(difference(frame, reactive)).toBeGreaterThan(12);
      expectGrid(reactive, grid);
    }
    expect(renderAsciiStudy(grid, 0.42, { x: 1, y: 1, strength: 0 })).toBe(
      frame
    );
  });
});

describe("original procedural horse", () => {
  it.each(sizes)(
    "is dominant and visible in the first frame at %ipx × %ipx",
    (width, height, cols) => {
      const grid = fitAsciiGrid(width, height, 0.61, cols);
      const frame = renderAsciiHorse(grid, 0.12, idleAsciiPointer);
      expectGrid(frame.horse, grid);
      expectGrid(frame.ground, grid);
      const bounds = inkBounds(frame.horse);
      expect(bounds.right - bounds.left).toBeGreaterThan(grid.cols * 0.35);
      expect(bounds.bottom - bounds.top).toBeGreaterThan(grid.rows * 0.52);
      expect(bounds.left).toBeGreaterThan(0);
      expect(bounds.right).toBeLessThan(grid.cols - 1);
      expect(bounds.top).toBeGreaterThan(0);
      expect(bounds.bottom).toBeLessThan(grid.rows - 1);
    }
  );

  it("keeps every pose visible, bounded and deterministic through a full gallop", () => {
    for (const [width, height, cols] of sizes) {
      const grid = fitAsciiGrid(width, height, 0.61, cols);
      for (let index = 0; index < 32; index++) {
        const pointer = { x: Math.cos(index), y: Math.sin(index), strength: 1 };
        const frame = renderAsciiHorse(grid, index / 32, pointer);
        expectGrid(frame.horse, grid);
        expect(frame.horse.replace(/\s/g, "").length).toBeGreaterThan(80);
        const bounds = inkBounds(frame.horse);
        expect(bounds.left).toBeGreaterThanOrEqual(0);
        expect(bounds.right).toBeLessThan(grid.cols);
        expect(bounds.top).toBeGreaterThanOrEqual(0);
        expect(bounds.bottom).toBeLessThan(grid.rows - 1);
      }
    }
    const grid = fitAsciiGrid(960, 420, 0.61, 112);
    expect(renderAsciiHorse(grid, 0.12, idleAsciiPointer)).toEqual(
      renderAsciiHorse(grid, 0.12, idleAsciiPointer)
    );
  });

  it("articulates continuously instead of jumping among tiny sprites", () => {
    const grid = fitAsciiGrid(960, 420, 0.61, 112);
    const first = renderAsciiHorse(grid, 0.12, idleAsciiPointer).horse;
    const nearby = renderAsciiHorse(grid, 0.13, idleAsciiPointer).horse;
    const extended = renderAsciiHorse(grid, 0.5, idleAsciiPointer).horse;
    expect(difference(first, nearby)).toBeGreaterThan(0);
    expect(difference(first, nearby)).toBeLessThan(difference(first, extended));
    expect(renderAsciiHorse(grid, 0, idleAsciiPointer)).toEqual(
      renderAsciiHorse(grid, 1, idleAsciiPointer)
    );
  });

  it("lets cursor position control speed and bounded deformation", () => {
    const grid = fitAsciiGrid(960, 420, 0.61, 112);
    const left = { x: -1, y: -1, strength: 1 };
    const right = { x: 1, y: 1, strength: 1 };
    expect(horseCycleRate(right)).toBeGreaterThan(horseCycleRate(left));
    expect(horseCycleRate(left)).toBeGreaterThan(
      horseCycleRate(idleAsciiPointer)
    );
    expect(horseCycleRate(right)).toBeLessThan(1.8);
    const first = renderAsciiHorse(grid, 0.12, left).horse;
    const second = renderAsciiHorse(grid, 0.12, right).horse;
    expect(difference(first, second)).toBeGreaterThan(80);
  });
});
