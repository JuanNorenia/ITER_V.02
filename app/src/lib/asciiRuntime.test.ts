import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAsciiScene } from "./asciiRuntime";
import type { AsciiSceneController } from "./asciiRuntime";
import type { AsciiGrid, AsciiPointer } from "./asciiGrid";

function rectangle(width = 640, height = 340) {
  return {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect;
}

class Root extends EventTarget {
  rect = rectangle();
  getBoundingClientRect() {
    return this.rect;
  }
  appendChild() {}
}

class Probe {
  style = {};
  textContent = "";
  setAttribute() {}
  getBoundingClientRect() {
    return rectangle(64 * 100 * 0.61, 100);
  }
  remove() {}
}

class SceneWindow extends EventTarget {
  innerWidth = 1440;
  innerHeight = 900;
}

class SceneDocument extends EventTarget {
  hidden = false;
  createElement() {
    return new Probe();
  }
}

function pointerEvent(x: number, y: number, pointerType = "mouse") {
  return Object.assign(new Event("pointermove", { cancelable: true }), {
    clientX: x,
    clientY: y,
    pointerType,
  });
}

describe("ASCII scene lifecycle", () => {
  let root: Root;
  let sceneWindow: SceneWindow;
  let sceneDocument: SceneDocument;
  let callbacks: Map<number, FrameRequestCallback>;
  let controllers: AsciiSceneController[];
  let resize: () => void;
  let intersect: (visible: boolean) => void;
  let now: number;
  let identifier: number;

  const paint =
    vi.fn<
      (
        grid: AsciiGrid,
        elapsed: number,
        delta: number,
        pointer: AsciiPointer
      ) => void
    >();

  beforeEach(() => {
    root = new Root();
    sceneWindow = new SceneWindow();
    sceneDocument = new SceneDocument();
    callbacks = new Map();
    controllers = [];
    now = 0;
    identifier = 0;
    paint.mockClear();
    vi.stubGlobal("window", sceneWindow);
    vi.stubGlobal("document", sceneDocument);
    vi.stubGlobal("getComputedStyle", () => ({
      fontFamily: "monospace",
      fontWeight: "400",
    }));
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callbacks.set(++identifier, callback);
      return identifier;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => callbacks.delete(id));
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = () => callback([], this as unknown as ResizeObserver);
        }
        observe() {}
        disconnect() {}
      }
    );
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          intersect = visible =>
            callback(
              [{ isIntersecting: visible } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver
            );
        }
        observe() {}
        disconnect() {}
      }
    );
  });

  afterEach(() => {
    controllers.forEach(controller => controller.dispose());
    vi.unstubAllGlobals();
  });

  function start(
    mode: "animated" | "reduced" | "touch" = "animated",
    background = false
  ) {
    const controller = createAsciiScene({
      root: root as unknown as HTMLElement,
      layers: [{ style: {} } as HTMLPreElement],
      mode,
      fps: 28,
      columns: () => 72,
      paint,
      continuous: !background,
      pointerScope: background ? "window" : "local",
    });
    controllers.push(controller);
    return controller;
  }

  function tick(milliseconds = 40) {
    now += milliseconds;
    const pending = [...callbacks.values()];
    callbacks.clear();
    pending.forEach(callback => callback(now));
  }

  it.each(["reduced", "touch"] as const)(
    "paints immediately and on resize, without a RAF in %s mode",
    mode => {
      start(mode);
      expect(paint).toHaveBeenCalledTimes(1);
      expect(callbacks.size).toBe(0);
      expect(
        paint.mock.calls[0][0].cellWidth / paint.mock.calls[0][0].fontSize
      ).toBeCloseTo(0.61);
      const previousWidth = paint.mock.calls[0][0].width;
      root.rect = rectangle(320, 260);
      resize();
      expect(paint).toHaveBeenCalledTimes(2);
      expect(paint.mock.calls[1][0].width).toBeLessThan(previousWidth);
      expect(paint.mock.calls[1][2]).toBe(0);
      root.dispatchEvent(pointerEvent(150, 120));
      expect(callbacks.size).toBe(0);
    }
  );

  it("maintains the requested cadence on a 60Hz display", () => {
    start();
    for (let index = 0; index < 60; index++) tick(1000 / 60);
    expect(paint.mock.calls.length).toBeGreaterThanOrEqual(28);
    expect(paint.mock.calls.length).toBeLessThanOrEqual(30);
  });

  it("actually cancels RAFs on manual pause and preserves elapsed time", () => {
    const controller = start();
    tick();
    const elapsed = paint.mock.calls.at(-1)![1];
    controller.setPaused(true);
    expect(callbacks.size).toBe(0);
    const count = paint.mock.calls.length;
    tick(10000);
    root.dispatchEvent(pointerEvent(300, 120));
    expect(paint).toHaveBeenCalledTimes(count);
    expect(callbacks.size).toBe(0);
    controller.setPaused(false);
    tick();
    expect(paint.mock.calls.at(-1)![1] - elapsed).toBeLessThan(0.08);
  });

  it("cancels outside the viewport and when the tab is hidden, without catch-up", () => {
    start();
    tick();
    intersect(false);
    expect(callbacks.size).toBe(0);
    tick(5000);
    intersect(true);
    tick();
    expect(paint.mock.calls.at(-1)![2]).toBeLessThan(0.08);
    sceneDocument.hidden = true;
    sceneDocument.dispatchEvent(new Event("visibilitychange"));
    expect(callbacks.size).toBe(0);
    tick(5000);
    sceneDocument.hidden = false;
    sceneDocument.dispatchEvent(new Event("visibilitychange"));
    tick();
    expect(paint.mock.calls.at(-1)![2]).toBeLessThan(0.08);
  });

  it("does not start an offscreen or initially hidden loop", () => {
    root.rect = { ...rectangle(), top: 1500, bottom: 1840 };
    start();
    expect(paint).toHaveBeenCalledTimes(1);
    expect(callbacks.size).toBe(0);
    intersect(true);
    expect(callbacks.size).toBe(1);
    sceneDocument.hidden = true;
    sceneDocument.dispatchEvent(new Event("visibilitychange"));
    expect(callbacks.size).toBe(0);
  });

  it("snaps the first lens sample to the cursor, not a distant sentinel", () => {
    start();
    const event = pointerEvent(480, 85);
    root.dispatchEvent(event);
    tick();
    const pointer = paint.mock.calls.at(-1)![3];
    expect(pointer.x).toBeCloseTo(0.5);
    expect(pointer.y).toBeCloseTo(-0.5);
    expect(pointer.strength).toBeGreaterThan(0.65);
    expect(event.defaultPrevented).toBe(false);
  });

  it("receives window pointer events behind overlays, then stops once settled", () => {
    start("animated", true);
    expect(callbacks.size).toBe(0);
    const event = pointerEvent(480, 85);
    sceneWindow.dispatchEvent(event);
    expect(callbacks.size).toBe(1);
    for (let index = 0; index < 20; index++) tick();
    expect(paint.mock.calls.at(-1)![3].strength).toBe(1);
    expect(paint.mock.calls.at(-1)![1]).toBe(0);
    expect(callbacks.size).toBe(0);
    expect(event.defaultPrevented).toBe(false);
    sceneWindow.dispatchEvent(pointerEvent(1000, 500));
    for (let index = 0; index < 20; index++) tick();
    expect(paint.mock.calls.at(-1)![3].strength).toBe(0);
    expect(callbacks.size).toBe(0);
  });

  it("ignores touch input and removes event handlers on disposal", () => {
    const controller = start("animated", true);
    sceneWindow.dispatchEvent(pointerEvent(300, 100, "touch"));
    expect(callbacks.size).toBe(0);
    controller.dispose();
    const count = paint.mock.calls.length;
    sceneWindow.dispatchEvent(pointerEvent(300, 100));
    resize();
    expect(callbacks.size).toBe(0);
    expect(paint).toHaveBeenCalledTimes(count);
  });
});
