import { describe, expect, it } from "vitest";
import { contactAsciiFrame } from "./contactAscii";

function differingCharacters(first: string, second: string) {
  return [...first].reduce(
    (count, character, index) => count + Number(character !== second[index]),
    0
  );
}

describe("contact ASCII field", () => {
  it("renders a deterministic printable grid with the requested dimensions", () => {
    const frame = contactAsciiFrame(64, 28, 0.42);
    const lines = frame.split("\n");

    expect(lines).toHaveLength(28);
    expect(lines.every(line => line.length === 64)).toBe(true);
    expect(frame).toMatch(/^[ .:+*#\n]+$/);
    expect(frame.replace(/[ \n]/g, "").length).toBeGreaterThan(0);
    expect(contactAsciiFrame(64, 28, 0.42)).toBe(frame);
  });

  it("wraps phases around one full cycle", () => {
    expect(contactAsciiFrame(64, 28, 0)).toBe(
      contactAsciiFrame(64, 28, 1)
    );
    expect(contactAsciiFrame(64, 28, 0.42)).toBe(
      contactAsciiFrame(64, 28, 1.42)
    );
  });

  it("changes shape through BUILD, SHIFT and CUT and keeps each frame bounded", () => {
    const phases = [0.12, 0.42, 0.82].map(phase =>
      contactAsciiFrame(72, 30, phase)
    );

    expect(new Set(phases).size).toBe(3);
    for (const frame of phases) {
      expect(frame.split("\n")).toHaveLength(30);
      expect(frame.split("\n").every(line => line.length === 72)).toBe(true);
    }
  });

  it("reacts deterministically to pointer position", () => {
    const idle = contactAsciiFrame(80, 36, 0.42);
    const first = contactAsciiFrame(80, 36, 0.42, { x: 0.25, y: 0.4 });
    const second = contactAsciiFrame(80, 36, 0.42, { x: 0.75, y: 0.6 });

    expect(first).not.toBe(idle);
    expect(second).not.toBe(first);
    expect(differingCharacters(idle, first)).toBeGreaterThan(0);
    expect(differingCharacters(first, second)).toBeGreaterThan(0);
    expect(contactAsciiFrame(80, 36, 0.42, { x: 0.25, y: 0.4 })).toBe(first);
  });
});
