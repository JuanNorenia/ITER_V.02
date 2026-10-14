import { fileURLToPath } from "node:url";

process.env.NODE_ENV = "production";
process.chdir(fileURLToPath(new URL("../", import.meta.url)));
await import("../dist/boot.js");
