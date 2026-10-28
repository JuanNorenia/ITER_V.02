import type { MiddlewareHandler } from "hono";

export function parseAllowedOrigins(
  value = process.env.ALLOWED_ORIGINS ?? ""
): Set<string> {
  const origins = new Set<string>();
  for (const item of value
    .split(",")
    .map(entry => entry.trim())
    .filter(Boolean)) {
    let url: URL;
    try {
      url = new URL(item);
    } catch {
      throw new Error(
        "ALLOWED_ORIGINS debe contener orígenes HTTP(S) separados por comas."
      );
    }
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new Error(
        "ALLOWED_ORIGINS no admite comodines, rutas, credenciales ni parámetros."
      );
    }
    origins.add(url.origin);
  }
  return origins;
}

/** ITER's production front ends must remain usable when Hostinger rewrites the
 * request URL to its internal origin before the API middleware sees it. */
export function getAllowedOrigins(
  value = process.env.ALLOWED_ORIGINS ?? ""
): Set<string> {
  return new Set([
    "https://itercol.com",
    "https://www.itercol.com",
    ...parseAllowedOrigins(value),
  ]);
}

export function apiCors(allowedOrigins: Set<string>): MiddlewareHandler {
  const methods = ["GET", "POST", "OPTIONS"];
  const headers = ["content-type", "trpc-accept"];
  return async (c, next) => {
    const origin = c.req.header("origin");
    c.header("Vary", "Origin");
    if (origin) {
      if (origin !== new URL(c.req.url).origin && !allowedOrigins.has(origin)) {
        return c.json(
          { error: "El origen de esta solicitud no está permitido." },
          403
        );
      }
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Access-Control-Allow-Credentials", "true");
    }
    if (c.req.method === "OPTIONS") {
      const requestedMethod = c.req.header("access-control-request-method");
      const requestedHeaders = (
        c.req.header("access-control-request-headers") ?? ""
      )
        .split(",")
        .map(header => header.trim().toLowerCase())
        .filter(Boolean);
      if (
        (requestedMethod && !methods.includes(requestedMethod)) ||
        requestedHeaders.some(header => !headers.includes(header))
      ) {
        return c.json({ error: "La solicitud CORS no está permitida." }, 403);
      }
      c.header("Access-Control-Allow-Methods", methods.join(", "));
      c.header("Access-Control-Allow-Headers", headers.join(", "));
      c.header("Access-Control-Max-Age", "600");
      c.header(
        "Vary",
        "Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
      );
      return c.body(null, 204);
    }
    await next();
    // tRPC devuelve su propio Response; aplicar CORS también al resultado final.
    const vary = new Set(
      (c.res.headers.get("Vary") ?? "")
        .split(",")
        .map(value => value.trim())
        .filter(Boolean)
    );
    vary.add("Origin");
    c.header("Vary", [...vary].join(", "));
    if (origin) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Access-Control-Allow-Credentials", "true");
    }
  };
}
