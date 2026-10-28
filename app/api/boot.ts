import { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { apiCors, getAllowedOrigins } from "./lib/api-cors";
import { getClientIp } from "./lib/client-ip";
import { requestBodyLimit } from "./lib/request-body";
import { createContactProvider } from "./providers/contact";

export function createApiApp() {
  const app = new Hono<{ Bindings: HttpBindings }>();

  app.use("/api/*", apiCors(getAllowedOrigins()));
  app.use("/api/*", requestBodyLimit());
  app.get("/api/health", c => {
    let configured = false;
    try {
      createContactProvider();
      configured = true;
    } catch {
      // Liveness no depende del proveedor; se informa su configuración sin secretos.
    }
    return c.json({ ok: true, contact: { configured } });
  });
  app.use("/api/trpc/*", async c => {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext: opts => createContext(opts, getClientIp(c)),
    });
  });
  app.all("/api/*", c => c.json({ error: "Not Found" }, 404));

  return app;
}

const app = createApiApp();

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
