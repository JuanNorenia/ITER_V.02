import { afterEach, describe, expect, it, vi } from "vitest";
import { validContact } from "../contract/contact.fixture";
import {
  CONTACT_PROVIDER_TIMEOUT_MS,
  ContactProviderError,
  createContactProvider,
} from "./contact";

const config = {
  CONTACT_PROVIDER: "resend",
  RESEND_API_KEY: "test-key-not-real",
  CONTACT_FROM_EMAIL: "iter@example.com",
  CONTACT_TO_EMAIL: "team@example.com",
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("contact adapters (mocked fetch only)", () => {
  it.each([
    {},
    { ...config, CONTACT_PROVIDER: undefined },
    { ...config, CONTACT_PROVIDER: "unsupported" },
    { CONTACT_PROVIDER: "webhook" },
    { CONTACT_FORWARD_URL: "not a URL" },
    { CONTACT_FORWARD_URL: "file:///private/contacts" },
    { CONTACT_FORWARD_URL: "https://user:secret@legacy.example/hook" },
    { CONTACT_FORWARD_URL: "https://legacy.example/hook#fragment" },
    { ...config, RESEND_API_KEY: "" },
    { ...config, RESEND_API_KEY: "key\r\ninjection" },
    { ...config, CONTACT_FROM_EMAIL: "" },
    { ...config, CONTACT_TO_EMAIL: "invalid" },
  ])(
    "fails honestly on missing or invalid configuration without sending: %j",
    env => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
      expect(() => createContactProvider(env)).toThrow(
        "No se ha enviado tu consulta"
      );
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("sends plain-text mail through native fetch and requires the provider confirmation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "mock-message-id" }))
      );
    vi.stubGlobal("fetch", fetchMock);
    const input = validContact();
    await expect(
      createContactProvider(config).send(input, "opaque-digest")
    ).resolves.toBeUndefined();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.redirect).toBe("error");
    expect(init.headers).toMatchObject({
      authorization: "Bearer test-key-not-real",
      "idempotency-key": "contact-opaque-digest",
    });
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      from: config.CONTACT_FROM_EMAIL,
      to: [config.CONTACT_TO_EMAIL],
      reply_to: input.email,
      subject: "Nueva consulta desde ITER",
    });
    expect(body.text).toContain(input.mensaje);
    expect(body.text).toContain("Integración de herramientas");
    expect(body.text).toContain("Autorización de tratamiento de datos: Sí");
    expect(body).not.toHaveProperty("html");
    expect(body).not.toHaveProperty("t");
    expect(body).not.toHaveProperty("website");
    expect(init.signal?.aborted).toBe(false);
  });

  it("accepts legacy Resend names without requiring CONTACT_PROVIDER", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "legacy-message-id" }))
      );
    vi.stubGlobal("fetch", fetchMock);
    await createContactProvider({
      RESEND_API_KEY: config.RESEND_API_KEY,
      CONTACT_FROM: config.CONTACT_FROM_EMAIL,
      CONTACT_TO: config.CONTACT_TO_EMAIL,
    }).send(validContact(), "digest");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      from: config.CONTACT_FROM_EMAIL,
      to: [config.CONTACT_TO_EMAIL],
    });
  });

  it("prefers explicit Resend and canonical addresses over legacy configuration", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "canonical-message-id" }))
      );
    vi.stubGlobal("fetch", fetchMock);
    await createContactProvider({
      ...config,
      CONTACT_FROM: "legacy-from@example.com",
      CONTACT_TO: "legacy-to@example.com",
      CONTACT_FORWARD_URL: "https://legacy.example/hook",
    }).send(validContact(), "digest");
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.resend.com/emails");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      from: config.CONTACT_FROM_EMAIL,
      to: [config.CONTACT_TO_EMAIL],
    });
  });

  it.each([undefined, "webhook"])(
    "preserves the legacy webhook payload and confirms only HTTP acceptance (%s)",
    async CONTACT_PROVIDER => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(null, { status: 204 }));
      vi.stubGlobal("fetch", fetchMock);
      const input = validContact();
      await createContactProvider({
        CONTACT_PROVIDER,
        CONTACT_FORWARD_URL: "https://legacy.example/hook",
      }).send(input, "digest");
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://legacy.example/hook");
      expect(init.redirect).toBe("error");
      expect(init.headers).toEqual({
        "content-type": "application/json",
        "idempotency-key": "contact-digest",
      });
      expect(JSON.parse(init.body as string)).toEqual({
        nombre: input.nombre,
        email: input.email,
        empresa: input.empresa,
        mensaje: input.mensaje,
        tipoNecesidad: input.tipoNecesidad,
        presupuesto: input.presupuesto,
      });
    }
  );

  it("does not accept a failed webhook response as success", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("private@example.com", { status: 503 }))
    );
    await expect(
      createContactProvider({
        CONTACT_FORWARD_URL: "https://legacy.example/hook",
      }).send(validContact(), "digest")
    ).rejects.toMatchObject({ kind: "failed" });
  });

  it.each([400, 401, 403, 429, 500, 503])(
    "rejects HTTP %i without exposing provider responses or logging PII",
    async status => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response("private@example.com secret-provider-error", {
            status,
          })
        )
      );
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      await expect(
        createContactProvider(config).send(validContact(), "digest")
      ).rejects.toMatchObject({
        kind: "failed",
        message:
          "No pudimos confirmar el envío con el proveedor de correo. Inténtalo de nuevo más tarde.",
      });
      expect(log).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    }
  );

  it.each([
    "",
    "not JSON",
    "{}",
    '{"id":""}',
    '{"id":42}',
    '{"error":"rejected"}',
  ])("rejects HTTP 2xx without a valid acceptance id: %j", async body => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(body, { status: 200 }))
    );
    await expect(
      createContactProvider(config).send(validContact(), "digest")
    ).rejects.toMatchObject({ kind: "failed" });
  });

  it("sanitizes network errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("private@example.com secret-key"))
    );
    await expect(
      createContactProvider(config).send(validContact(), "digest")
    ).rejects.toBeInstanceOf(ContactProviderError);
    await expect(
      createContactProvider(config).send(validContact(), "digest")
    ).rejects.not.toThrow("private@example.com");
  });

  it("aborts and reports unconfirmed delivery on timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener(
              "abort",
              () => reject(new Error("aborted")),
              { once: true }
            );
          })
      )
    );
    const assertion = expect(
      createContactProvider(config).send(validContact(), "digest")
    ).rejects.toMatchObject({
      kind: "timeout",
      message: expect.stringContaining("No pudimos confirmar"),
    });
    await vi.advanceTimersByTimeAsync(CONTACT_PROVIDER_TIMEOUT_MS);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
});
