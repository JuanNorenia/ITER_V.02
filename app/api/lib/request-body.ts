import type { MiddlewareHandler } from "hono";

export const API_BODY_LIMIT_BYTES = 16 * 1024;

export function requestBodyLimit(
  maxBytes = API_BODY_LIMIT_BYTES
): MiddlewareHandler {
  return async (c, next) => {
    const tooLarge = () =>
      c.json({ error: "La solicitud es demasiado grande." }, 413);
    const declaredLength = Number(c.req.header("content-length"));
    if (declaredLength > maxBytes) return tooLarge();
    if (!c.req.raw.body) return next();

    const reader = c.req.raw.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          void reader.cancel().catch(() => {});
          return tooLarge();
        }
        chunks.push(value);
      }
    } catch {
      return c.json({ error: "No pudimos leer la solicitud." }, 400);
    } finally {
      reader.releaseLock();
    }

    // Se cuenta el cuerpo real incluso si Content-Length falta o es incorrecto.
    const init = {
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          for (const chunk of chunks) controller.enqueue(chunk);
          controller.close();
        },
      }),
      duplex: "half" as const,
    };
    // Construir desde la URL evita pasar entre runtimes el objeto Request
    // envuelto por Hono/Vite (sus slots privados no siempre son compatibles).
    c.req.raw = new Request(c.req.raw.url, {
      ...init,
      method: c.req.raw.method,
      headers: new Headers(c.req.raw.headers),
    });
    await next();
  };
}
