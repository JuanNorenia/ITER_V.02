import { defineConfig, devices } from "@playwright/test";

const emptyContactEnvironment = Object.fromEntries(
  Object.keys(process.env)
    .filter(name => /^(CONTACT_|RESEND_)/u.test(name))
    .map(name => [name, ""])
);
const inheritedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => entry[1] !== undefined
  )
);

const isolatedEnvironment = {
  ...inheritedEnvironment,
  ...emptyContactEnvironment,
  CONTACT_PROVIDER: "",
  CONTACT_FORWARD_URL: "",
  RESEND_API_KEY: "",
  CONTACT_FROM_EMAIL: "",
  CONTACT_TO_EMAIL: "",
  CONTACT_FROM: "",
  CONTACT_TO: "",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 4,
  reporter: "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
    actionTimeout: 5_000,
    navigationTimeout: 10_000,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium-desktop", use: { browserName: "chromium" } }],
  webServer: [
    {
      command:
        "npm run dev -- --host 127.0.0.1 --port 3100 --strictPort",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        ...isolatedEnvironment,
        NODE_ENV: "development",
        VITE_BASE_PATH: "/",
        VITE_API_BASE_URL: "",
      },
    },
    {
      command:
        "npm run build:pages && npm run preview -- --host 127.0.0.1 --port 3101 --strictPort",
      url: "http://127.0.0.1:3101/ITER_V.02/",
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ...isolatedEnvironment,
        NODE_ENV: "production",
        VITE_BASE_PATH: "/ITER_V.02/",
        VITE_API_BASE_URL: "",
      },
    },
  ],
});
