import { once } from "node:events";
import { Server } from "node:http";
import { serve, type HttpBindings } from "@hono/node-server";
import type { Hono } from "hono";

export async function withHttpServer<T>(
  app: Hono<{ Bindings: HttpBindings }>,
  run: (baseUrl: string) => Promise<T>
): Promise<T> {
  const server = serve({ fetch: app.fetch, hostname: "127.0.0.1", port: 0 });
  try {
    await once(server, "listening", { signal: AbortSignal.timeout(3000) });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("The test HTTP server did not get a TCP address");
    }
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    const closed = new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });
    if (server instanceof Server) server.closeAllConnections();
    await closed;
  }
}

export function httpFetch(url: string, init: RequestInit = {}) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(3000) });
}
