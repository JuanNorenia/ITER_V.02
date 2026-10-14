import { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { httpFetch, withHttpServer } from "../contract/http.fixture";
import { getClientIp } from "./client-ip";

function ipApp() {
  return new Hono<{ Bindings: HttpBindings }>().get("/", c =>
    c.json({ ip: getClientIp(c) ?? null })
  );
}

afterEach(() => vi.unstubAllEnvs());

describe("trusted client IP", () => {
  it.each(["", "false", "1", "TRUE"])(
    "uses the socket rather than public forwarding headers when TRUST_PROXY=%s",
    async trustProxy => {
      vi.stubEnv("TRUST_PROXY", trustProxy);
      await withHttpServer(ipApp(), async baseUrl => {
        const response = await httpFetch(baseUrl, {
          headers: { "x-forwarded-for": "192.0.2.1" },
        });
        expect(await response.json()).toEqual({ ip: "127.0.0.1" });
      });
    }
  );

  it.each(["192.0.2.1, 198.51.100.2", "2001:db8::1"])(
    "uses a valid forwarded IP only with explicit TRUST_PROXY=true: %s",
    async forwarded => {
      vi.stubEnv("TRUST_PROXY", "true");
      await withHttpServer(ipApp(), async baseUrl => {
        const response = await httpFetch(baseUrl, {
          headers: { "x-forwarded-for": forwarded },
        });
        expect(await response.json()).toEqual({ ip: forwarded.split(",")[0] });
      });
    }
  );

  it.each(["unknown", "192.0.2.1:1234", "a".repeat(1025), ""])(
    "falls back to the socket for invalid or oversized forwarded addresses (%#)",
    async forwarded => {
      vi.stubEnv("TRUST_PROXY", "true");
      await withHttpServer(ipApp(), async baseUrl => {
        const response = await httpFetch(baseUrl, {
          headers: { "x-forwarded-for": forwarded },
        });
        expect(await response.json()).toEqual({ ip: "127.0.0.1" });
      });
    }
  );

  it("does not trust headers when an adapter has no socket", async () => {
    vi.stubEnv("TRUST_PROXY", "false");
    const response = await ipApp().request("http://localhost/", {
      headers: { "x-forwarded-for": "192.0.2.1" },
    });
    expect(await response.json()).toEqual({ ip: null });
  });
});
