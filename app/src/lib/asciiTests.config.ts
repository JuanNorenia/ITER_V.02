import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The application's default Vitest configuration only discovers API tests.
export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  test: {
    environment: "node",
    include: ["src/lib/ascii*.test.ts"],
  },
});
