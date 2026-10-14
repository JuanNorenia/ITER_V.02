import { createHmac, randomBytes } from "node:crypto";
import type { ContactInput } from "../../contracts/contact";

export const CONTACT_WINDOW_MS = 10 * 60 * 1000;

type RateEntry = { count: number; expiresAt: number };

/** Solo conserva HMACs efímeros, contadores y expiraciones; nunca leads ni IPs. */
export class ContactGuard {
  private readonly secret = randomBytes(32);
  private readonly rates = new Map<string, RateEntry>();
  private readonly submissions = new Map<string, number>();

  private readonly maxEntries: number;
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxEntries = 2048, maxAttempts = 5, windowMs = CONTACT_WINDOW_MS) {
    this.maxEntries = maxEntries;
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  private hash(value: string): string {
    return createHmac("sha256", this.secret).update(value).digest("hex");
  }

  private cleanup(now: number): void {
    for (const [key, entry] of this.rates) {
      if (entry.expiresAt <= now) this.rates.delete(key);
    }
    for (const [key, expiresAt] of this.submissions) {
      if (expiresAt <= now) this.submissions.delete(key);
    }
  }

  allowAttempt(clientIp: string | undefined, now: number): boolean {
    this.cleanup(now);
    const key = this.hash(`ip:${clientIp ?? "unknown"}`);
    const entry = this.rates.get(key);
    if (entry) {
      if (entry.count >= this.maxAttempts) return false;
      entry.count += 1;
      return true;
    }
    // No se expulsan entradas activas: una inundación no debe saltarse el límite.
    if (this.rates.size >= this.maxEntries) return false;
    this.rates.set(key, { count: 1, expiresAt: now + this.windowMs });
    return true;
  }

  reserve(input: ContactInput, now: number): string | undefined {
    this.cleanup(now);
    const key = this.hash(
      JSON.stringify([
        input.nombre,
        input.email.toLowerCase(),
        input.empresa || "",
        input.mensaje,
        input.tipoNecesidad || "",
        input.presupuesto || "",
      ])
    );
    if (this.submissions.has(key) || this.submissions.size >= this.maxEntries) {
      return undefined;
    }
    this.submissions.set(key, now + this.windowMs);
    return key;
  }

  release(key: string): void {
    this.submissions.delete(key);
  }
}
