import { describe, expect, it } from "vitest";
import { validContact } from "../contract/contact.fixture";
import { ContactGuard } from "./contact-guard";

const now = 1700000000000;

describe("bounded in-memory contact guard", () => {
  it("limits each client to five attempts and cleans up expired buckets", () => {
    const guard = new ContactGuard(2, 5, 1000);
    for (let i = 0; i < 5; i++)
      expect(guard.allowAttempt("192.0.2.1", now)).toBe(true);
    expect(guard.allowAttempt("192.0.2.1", now)).toBe(false);
    expect(guard.allowAttempt("192.0.2.2", now)).toBe(true);
    expect(guard.allowAttempt("192.0.2.1", now + 1000)).toBe(true);
  });

  it("fails closed instead of evicting active entries when client capacity is exhausted", () => {
    const guard = new ContactGuard(2, 1, 1000);
    expect(guard.allowAttempt("192.0.2.1", now)).toBe(true);
    expect(guard.allowAttempt("192.0.2.2", now)).toBe(true);
    for (let i = 0; i < 100; i++)
      expect(guard.allowAttempt(`unknown-${i}`, now)).toBe(false);
    expect(guard.allowAttempt("192.0.2.1", now)).toBe(false);
    expect(guard.allowAttempt("192.0.2.3", now + 1000)).toBe(true);
  });

  it("uses a shared bucket when no trusted client address is available", () => {
    const guard = new ContactGuard(2, 1);
    expect(guard.allowAttempt(undefined, now)).toBe(true);
    expect(guard.allowAttempt(undefined, now)).toBe(false);
  });

  it("reserves opaque digests without timestamps and frees failed submissions", () => {
    const guard = new ContactGuard();
    const input = validContact(now);
    const key = guard.reserve(input, now);
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(
      guard.reserve(
        { ...input, email: input.email.toUpperCase(), t: now - 10000 },
        now
      )
    ).toBeUndefined();
    guard.release(key!);
    expect(guard.reserve(input, now)).toBe(key);
    expect(new ContactGuard().reserve(input, now)).not.toBe(key);
  });

  it("bounds deduplication entries and cleans them up after expiry", () => {
    const guard = new ContactGuard(2, 5, 1000);
    expect(guard.reserve(validContact(now), now)).toBeDefined();
    expect(
      guard.reserve(
        { ...validContact(now), mensaje: "Otra consulta válida y diferente" },
        now
      )
    ).toBeDefined();
    const third = {
      ...validContact(now),
      mensaje: "Tercera consulta válida y diferente",
    };
    expect(guard.reserve(third, now)).toBeUndefined();
    expect(guard.reserve(third, now + 1000)).toBeDefined();
  });
});
