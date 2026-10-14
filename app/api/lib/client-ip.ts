import { isIP } from "node:net";
import { getConnInfo } from "@hono/node-server/conninfo";
import type { HttpBindings } from "@hono/node-server";
import type { Context } from "hono";

export function getClientIp(
  c: Context<{ Bindings: HttpBindings }>
): string | undefined {
  // Activar solo detrás de un proxy que elimine/sustituya el XFF del cliente.
  if (process.env.TRUST_PROXY === "true") {
    const forwarded = c.req.header("x-forwarded-for");
    if (forwarded && forwarded.length <= 1024) {
      const address = forwarded.split(",", 1)[0].trim();
      if (isIP(address)) return address;
    }
  }
  try {
    const address = getConnInfo(c).remote.address;
    return address && isIP(address) ? address : undefined;
  } catch {
    // Adaptadores sin socket comparten un bucket, sin confiar en cabeceras públicas.
    return undefined;
  }
}
