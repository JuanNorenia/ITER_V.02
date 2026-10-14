import { afterEach, describe, expect, it, vi } from "vitest";
import { validContact } from "../contract/contact.fixture";
import { ContactGuard } from "../lib/contact-guard";
import { ContactProviderError } from "../providers/contact";
import { createContactRouter } from "./contact";

const now = 1700000000000;

function setup() {
  const send = vi.fn().mockResolvedValue(undefined);
  const provider = vi.fn(() => ({ send }));
  const router = createContactRouter({
    provider,
    now: () => now,
    guard: new ContactGuard(),
  });
  const caller = (ip = "192.0.2.1") =>
    router.createCaller({
      req: new Request("http://localhost/api/trpc"),
      resHeaders: new Headers(),
      clientIp: ip,
    });
  return { send, provider, caller };
}

afterEach(() => vi.unstubAllEnvs());

describe("contact.submit", () => {
  it("succeeds only after the configured provider confirms the submission", async () => {
    const { caller, send } = setup();
    await expect(caller().submit(validContact(now))).resolves.toEqual({
      ok: true,
      forwarded: true,
    });
    expect(send).toHaveBeenCalledWith(
      validContact(now),
      expect.stringMatching(/^[a-f0-9]{64}$/)
    );
  });

  it("rejects missing configuration in Spanish without needing DB or AI credentials", async () => {
    vi.stubEnv("CONTACT_PROVIDER", "");
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("APP_ID", "");
    vi.stubEnv("APP_SECRET", "");
    const caller = createContactRouter({ now: () => now }).createCaller({
      req: new Request("http://localhost/api/trpc"),
      resHeaders: new Headers(),
    });
    await expect(caller.submit(validContact(now))).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message: expect.stringContaining("No se ha enviado tu consulta"),
    });
  });

  it.each([
    { consentimiento: false },
    { email: "invalid" },
    { mensaje: "corto" },
    { mensaje: "a".repeat(2001) },
    { website: "spam" },
    { t: now },
    { t: now + 1000 },
    { t: now - 24 * 60 * 60 * 1000 - 1 },
  ])(
    "rejects invalid input/consent/spam before provider access: %j",
    async invalid => {
      const { caller, provider, send } = setup();
      const input = { ...validContact(now), ...invalid } as Parameters<
        ReturnType<typeof caller>["submit"]
      >[0];
      await expect(caller().submit(input)).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
      expect(provider).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    }
  );

  it.each([
    ["failed", "BAD_GATEWAY"],
    ["timeout", "TIMEOUT"],
    ["unavailable", "SERVICE_UNAVAILABLE"],
  ] as const)(
    "maps provider %s to %s, never to success",
    async (kind, code) => {
      const { caller, send } = setup();
      send.mockRejectedValueOnce(new ContactProviderError(kind));
      await expect(caller().submit(validContact(now))).rejects.toMatchObject({
        code,
      });
      await expect(caller().submit(validContact(now))).resolves.toMatchObject({
        ok: true,
      });
      expect(send.mock.calls[0][1]).toBe(send.mock.calls[1][1]);
    }
  );

  it("does not expose unexpected provider errors", async () => {
    const { caller, send } = setup();
    send.mockRejectedValueOnce(
      new Error("persona@example.com private-provider-error")
    );
    await expect(caller().submit(validContact(now))).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "No pudimos confirmar el envío de tu consulta. Inténtalo de nuevo más tarde.",
    });
  });

  it("counts rejected validation attempts toward the limit", async () => {
    const { caller, send } = setup();
    for (let i = 0; i < 5; i++) {
      await expect(
        caller().submit({ ...validContact(now), website: "spam" })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    await expect(caller().submit(validContact(now))).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
    expect(send).not.toHaveBeenCalled();
    await expect(
      caller("192.0.2.2").submit(validContact(now))
    ).resolves.toMatchObject({ ok: true });
  });

  it("rejects duplicates even from another client or with a different form timestamp", async () => {
    const { caller, send } = setup();
    await caller().submit(validContact(now));
    await expect(
      caller("192.0.2.2").submit({ ...validContact(now), t: now - 10000 })
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("rejects a concurrent duplicate before contacting the provider twice", async () => {
    const { caller, send } = setup();
    let finish!: () => void;
    let started!: () => void;
    const providerStarted = new Promise<void>(resolve => {
      started = resolve;
    });
    send.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          finish = resolve;
          started();
        })
    );
    const pending = caller().submit(validContact(now));
    await providerStarted;
    await expect(
      caller("192.0.2.2").submit(validContact(now))
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    finish();
    await expect(pending).resolves.toMatchObject({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);
  });
});
