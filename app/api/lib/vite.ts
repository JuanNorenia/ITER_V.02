import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // The deployment output directory (`dist`) is published as the Node app
  // root on Hostinger, while local production keeps `boot.js` inside `dist/`.
  const publicPath = path.resolve(import.meta.dirname, "public");

  app.use("*", serveStatic({ root: publicPath }));

  app.notFound(c => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(publicPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    const knownPage = c.req.path === "/" || c.req.path === "/contacto";
    return c.html(content, knownPage ? 200 : 404);
  });
}
