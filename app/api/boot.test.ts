import { request as nodeRequest } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import superjson from "superjson";
import { createApiApp } from "./boot";
import { validContact } from "./contract/contact.fixture";
import { httpFetch, withHttpServer } from "./contract/http.fixture";
import { API_BODY_LIMIT_BYTES } from "./lib/request-body";

type ErrorEnvelope = { error: ReturnType<typeof superjson.serialize> };
type RpcError = {
  message: string;
  data: { code: string; httpStatus: number };
};
const allowedOrigin = "https://iter-example.github.io";

beforeEach(() => {
  for (const key of [
    "CONTACT_PROVIDER",
    "CONTACT_FORWARD_URL",
    "RESEND_API_KEY",
    "CONTACT_FROM_EMAIL",
    "CONTACT_TO_EMAIL",
    "CONTACT_FROM",
    "CONTACT_TO",
    "DATABASE_URL",
    "APP_ID",
    "APP_SECRET",
    "TRUST_PROXY",
  ])
    vi.stubEnv(key, "");
  vi.stubEnv("ALLOWED_ORIGINS", `${allowedOrigin},http://localhost:5173`);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function submit(baseUrl: string, input: unknown, batch = false) {
  const data = superjson.serialize(input);
  return httpFetch(
    `${baseUrl}/api/trpc/contact.submit${batch ? "?batch=1" : ""}`,
    {
      method: "POST",
      headers: { "content-type": "application/json", origin: allowedOrigin },
      body: JSON.stringify(batch ? { 0: data } : data),
    }
  );
}

function chunkedPost(url: string, body: string) {
  return new Promise<{ status: number | undefined; body: string }>(
    (resolve, reject) => {
      const request = nodeRequest(
        url,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: allowedOrigin,
          },
        },
        response => {
          let text = "";
          response.setEncoding("utf8");
          response.on("data", (chunk: string) => {
            text += chunk;
          });
          response.on("error", reject);
          response.on("end", () =>
            resolve({ status: response.statusCode, body: text })
          );
        }
      );
      request.on("error", reject);
      request.setTimeout(3000, () =>
        request.destroy(new Error("Test HTTP request timed out"))
      );
      request.write(body.slice(0, API_BODY_LIMIT_BYTES / 2));
      request.end(body.slice(API_BODY_LIMIT_BYTES / 2));
    }
  );
}

describe("API over a real HTTP socket", () => {
  it("serves health in production without DB or AI credentials and reports missing contact configuration", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await httpFetch(`${baseUrl}/api/health`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ok: true,
        contact: { configured: false },
      });
    });
  });

  it("reports valid provider configuration without attempting a delivery", async () => {
    vi.stubEnv("CONTACT_PROVIDER", "resend");
    vi.stubEnv("RESEND_API_KEY", "test-not-real");
    vi.stubEnv("CONTACT_FROM_EMAIL", "iter@example.com");
    vi.stubEnv("CONTACT_TO_EMAIL", "team@example.com");
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await httpFetch(`${baseUrl}/api/health`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ok: true,
        contact: { configured: true },
      });
    });
  });

  it.each([false, true])(
    "returns HTTP 503, not 500 or success, when no provider exists (batch=%s)",
    async batch => {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
      await withHttpServer(createApiApp(), async baseUrl => {
        const input = validContact();
        const response = await submit(baseUrl, input, batch);
        expect(response.status).toBe(503);
        expect(response.headers.get("access-control-allow-origin")).toBe(
          allowedOrigin
        );
        const text = await response.text();
        const json = JSON.parse(text) as ErrorEnvelope | ErrorEnvelope[];
        const envelope = Array.isArray(json) ? json[0] : json;
        const error = superjson.deserialize<RpcError>(envelope.error);
        expect(error.data).toMatchObject({
          code: "SERVICE_UNAVAILABLE",
          httpStatus: 503,
        });
        expect(error.message).toContain("No se ha enviado tu consulta");
        expect(text).not.toContain('"result"');
        expect(text).not.toContain(input.email);
        expect(text).not.toContain(input.nombre);
      });
      expect(log).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      expect(errorLog).not.toHaveBeenCalled();
    }
  );

  it("returns the unchanged success contract only after provider confirmation", async () => {
    vi.stubEnv("CONTACT_PROVIDER", "resend");
    vi.stubEnv("RESEND_API_KEY", "test-not-real");
    vi.stubEnv("CONTACT_FROM_EMAIL", "iter@example.com");
    vi.stubEnv("CONTACT_TO_EMAIL", "team@example.com");
    const nativeFetch = globalThis.fetch;
    const forward = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "mock-message-id" }))
      );
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      return url === "https://api.resend.com/emails"
        ? forward(input, init)
        : nativeFetch(input, init);
    });
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await submit(baseUrl, validContact());
      expect(response.status).toBe(200);
      const json = (await response.json()) as {
        result: { data: ReturnType<typeof superjson.serialize> };
      };
      expect(superjson.deserialize(json.result.data)).toEqual({
        ok: true,
        forwarded: true,
      });
    });
    expect(forward).toHaveBeenCalledTimes(1);
  });

  it("does not echo PII from arbitrary validation keys", async () => {
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await submit(baseUrl, {
        ...validContact(),
        "private-client-key@example.com": "private-client-value",
      });
      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain("Revisa los datos del formulario");
      expect(text).not.toContain("private-client");
      expect(text).not.toContain("persona@example.com");
    });
  });

  it("preserves the scaffold ping without requiring DB credentials", async () => {
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await httpFetch(`${baseUrl}/api/trpc/ping`);
      expect(response.status).toBe(200);
      const json = (await response.json()) as {
        result: { data: ReturnType<typeof superjson.serialize> };
      };
      expect(superjson.deserialize(json.result.data)).toMatchObject({
        ok: true,
        ts: expect.any(Number),
      });
    });
  });

  it("allows an allowlisted Pages preflight", async () => {
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await httpFetch(`${baseUrl}/api/trpc/contact.submit`, {
        method: "OPTIONS",
        headers: {
          origin: allowedOrigin,
          "access-control-request-method": "POST",
          "access-control-request-headers": "Content-Type, trpc-accept",
        },
      });
      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-origin")).toBe(
        allowedOrigin
      );
      expect(response.headers.get("access-control-allow-credentials")).toBe(
        "true"
      );
      expect(response.headers.get("access-control-allow-methods")).toContain(
        "POST"
      );
      expect(response.headers.get("vary")).toContain("Origin");
      expect(response.headers.get("vary")).toContain(
        "Access-Control-Request-Headers"
      );
    });
  });

  it.each([allowedOrigin, "http://localhost:5173"])(
    "allows health from %s",
    async origin => {
      await withHttpServer(createApiApp(), async baseUrl => {
        const response = await httpFetch(`${baseUrl}/api/health`, {
          headers: { origin },
        });
        expect(response.status).toBe(200);
        expect(response.headers.get("access-control-allow-origin")).toBe(
          origin
        );
        await response.body?.cancel();
      });
    }
  );

  it("allows same-origin requests without an allowlist entry", async () => {
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await httpFetch(`${baseUrl}/api/health`, {
        headers: { origin: baseUrl },
      });
      expect(response.status).toBe(200);
      expect(response.headers.get("access-control-allow-origin")).toBe(baseUrl);
      await response.body?.cancel();
    });
  });

  it.each([
    "https://unlisted.example",
    `${allowedOrigin}.evil.example`,
    "null",
  ])("rejects unlisted origin %s before dispatching contact", async origin => {
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await httpFetch(`${baseUrl}/api/trpc/contact.submit`, {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify(superjson.serialize(validContact())),
      });
      expect(response.status).toBe(403);
      expect(response.headers.get("access-control-allow-origin")).toBeNull();
      expect(await response.text()).not.toContain('"result"');
    });
  });

  it.each([
    { "access-control-request-method": "DELETE" },
    { "access-control-request-headers": "x-unapproved-header" },
  ])(
    "rejects unsupported CORS preflight parameters: %j",
    async extraHeaders => {
      await withHttpServer(createApiApp(), async baseUrl => {
        const response = await httpFetch(`${baseUrl}/api/trpc/contact.submit`, {
          method: "OPTIONS",
          headers: { origin: allowedOrigin, ...extraHeaders },
        });
        expect(response.status).toBe(403);
        await response.body?.cancel();
      });
    }
  );

  it("rejects oversized declared bodies with HTTP 413 and CORS headers", async () => {
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await httpFetch(`${baseUrl}/api/trpc/contact.submit`, {
        method: "POST",
        headers: { origin: allowedOrigin, "content-type": "application/json" },
        body: "a".repeat(API_BODY_LIMIT_BYTES + 1),
      });
      expect(response.status).toBe(413);
      expect(response.headers.get("access-control-allow-origin")).toBe(
        allowedOrigin
      );
      expect(await response.json()).toEqual({
        error: "La solicitud es demasiado grande.",
      });
    });
  });

  it("counts actual streamed bytes without Content-Length", async () => {
    await withHttpServer(createApiApp(), async baseUrl => {
      const response = await chunkedPost(
        `${baseUrl}/api/trpc/contact.submit`,
        "a".repeat(API_BODY_LIMIT_BYTES + 1)
      );
      expect(response.status).toBe(413);
      expect(JSON.parse(response.body)).toEqual({
        error: "La solicitud es demasiado grande.",
      });
    });
  });
});
