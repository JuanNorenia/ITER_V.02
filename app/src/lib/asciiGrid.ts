export interface AsciiGrid {
  cols: number;
  rows: number;
  width: number;
  height: number;
  cellWidth: number;
  lineHeight: number;
  fontSize: number;
}

export interface AsciiPointer {
  x: number;
  y: number;
  strength: number;
}

export const idleAsciiPointer: AsciiPointer = { x: 0, y: 0, strength: 0 };
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export const mix = (a: number, b: number, amount: number) =>
  a + (b - a) * amount;
export const wrap = (value: number) => ((value % 1) + 1) % 1;

/** Uses the measured glyph advance, not an assumed 0.6em monospace width. */
export function fitAsciiGrid(
  width: number,
  height: number,
  glyphRatio: number,
  targetCols: number,
  maxRows = 72
): AsciiGrid {
  const availableWidth = Math.max(1, width - 1);
  const availableHeight = Math.max(1, height - 1);
  const ratio = clamp(glyphRatio, 0.3, 1.2);
  const fontSize = Math.max(
    availableWidth / (Math.max(8, targetCols) * ratio),
    availableHeight / (maxRows * 1.22)
  );
  const cellWidth = fontSize * ratio;
  const lineHeight = fontSize * 1.22;
  const cols = Math.max(1, Math.floor(availableWidth / cellWidth + 1e-8));
  const rows = Math.max(1, Math.floor(availableHeight / lineHeight + 1e-8));
  return {
    cols,
    rows,
    width: cols * cellWidth,
    height: rows * lineHeight,
    cellWidth,
    lineHeight,
    fontSize,
  };
}

export function asciiHash(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
