import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "./env";

afterEach(() => vi.unstubAllEnvs());

describe("lazy backend environment", () => {
  it("does not require optional feature secrets to inspect production configuration", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ID", "");
    vi.stubEnv("APP_SECRET", "");
    vi.stubEnv("DATABASE_URL", "");
    expect(env.isProduction).toBe(true);
    expect(() => env.appId).toThrow("APP_ID");
    expect(() => env.appSecret).toThrow("APP_SECRET");
    expect(() => env.databaseUrl).toThrow("DATABASE_URL");
  });

  it("reads credentials only when a feature accesses them", () => {
    vi.stubEnv("APP_ID", "test-app");
    vi.stubEnv("APP_SECRET", "test-secret");
    vi.stubEnv("DATABASE_URL", "test-database");
    expect(env.appId).toBe("test-app");
    expect(env.appSecret).toBe("test-secret");
    expect(env.databaseUrl).toBe("test-database");
  });
});
