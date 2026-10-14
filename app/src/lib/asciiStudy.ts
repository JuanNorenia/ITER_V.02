import { asciiHash, clamp, mix, wrap } from "./asciiGrid";
import type { AsciiGrid, AsciiPointer } from "./asciiGrid";

export type AsciiPhase = "BUILD" | "SHIFT" | "CUT" | "RE";
export const ASCII_PHASES: AsciiPhase[] = ["BUILD", "SHIFT", "CUT", "RE"];
const RAMP = " .:-=+*#%@";
const ease = (value: number) => value * value * (3 - 2 * value);
const density = (distance: number) => clamp((0.035 - distance) / 0.07, 0, 1);
const box = (x: number, y: number, radius: number) =>
  Math.max(Math.abs(x), Math.abs(y)) - radius;

export function asciiPhaseAt(progress: number): AsciiPhase {
  const value = wrap(progress);
  return value < 0.3
    ? "BUILD"
    : value < 0.6
      ? "SHIFT"
      : value < 0.85
        ? "CUT"
        : "RE";
}

function studyField(x: number, y: number, progress: number, aspect: number) {
  let result = 0;
  if (progress < 0.3) {
    const build = progress / 0.3;
    const radius = 0.62 * (1 - (1 - build) ** 3);
    result = density(Math.hypot(x, y) - radius);
    const orbit = mix(1.15, 0.79, ease(build));
    for (let index = 0; index < 8; index++) {
      const angle = (index / 8) * Math.PI * 2;
      result = Math.max(
        result,
        density(
          box(
            x - Math.cos(angle) * orbit * Math.min(aspect, 1.2),
            y - Math.sin(angle) * orbit,
            0.055
          )
        )
      );
    }
  } else if (progress < 0.6) {
    const shift = ease((progress - 0.3) / 0.3);
    result = density(Math.hypot(x - y * 0.45 * (shift * 2 - 1), y) - 0.62);
    result = Math.max(
      result,
      density(box(x - mix(-aspect * 0.8, aspect * 0.35, shift), y, 0.21))
    );
  } else if (progress < 0.85) {
    const cut = ease((progress - 0.6) / 0.25);
    result = Math.max(
      density(Math.hypot(x - y * 0.45, y) - 0.62),
      density(box(x - aspect * 0.35, y, 0.21))
    );
    if (Math.abs(x - mix(-aspect, aspect, cut)) < 0.15) result = 0;
  } else {
    const rebuild = 1 - ease((progress - 0.85) / 0.15);
    result = Math.max(
      density(Math.hypot(x, y) - 0.62 * rebuild),
      density(box(x - aspect * 0.35, y, 0.21 * rebuild))
    );
  }
  return result;
}

/** A local lens affects even empty cells; its first pointer sample is immediate. */
export function renderAsciiStudy(
  grid: AsciiGrid,
  progress: number,
  pointer: AsciiPointer
): string {
  const aspect = grid.width / grid.height;
  const phase = wrap(progress);
  const px = clamp(pointer.x, -1, 1) * aspect;
  const py = clamp(pointer.y, -1, 1);
  const strength = clamp(pointer.strength, 0, 1);
  const lines: string[] = [];
  for (let row = 0; row < grid.rows; row++) {
    const y = ((row + 0.5) / grid.rows) * 2 - 1;
    let line = "";
    for (let col = 0; col < grid.cols; col++) {
      const x = (((col + 0.5) / grid.cols) * 2 - 1) * aspect;
      const dx = x - px;
      const dy = y - py;
      const distance = Math.hypot(dx, dy);
      const falloff = Math.exp(-(distance * distance) / 0.16) * strength;
      const shift = (falloff * 0.27) / Math.max(0.08, distance);
      const sx = x + dx * shift - falloff * py * 0.1;
      const sy = y + dy * shift + falloff * px * 0.06;
      let value = Math.max(
        asciiHash(col, row) > 0.78 ? 0.12 : 0,
        studyField(sx, sy, phase, aspect)
      );
      // A bright centre and a subtractive ring keep the cursor legible in solid areas.
      value = clamp(value * (1 - falloff * 0.7) + falloff * 0.42, 0, 1);
      if (strength > 0 && distance < 0.075)
        value = Math.max(value, strength * 0.95);
      line += RAMP[Math.min(RAMP.length - 1, Math.floor(value * RAMP.length))];
    }
    lines.push(line);
  }
  return lines.join("\n");
}
