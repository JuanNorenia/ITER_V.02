import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { contactSchema, type ContactResult } from "@contracts/contact";
import { ContactGuard } from "../lib/contact-guard";
import {
  ContactProviderError,
  createContactProvider,
  type ContactProvider,
} from "../providers/contact";

type ContactRouterOptions = {
  provider?: () => ContactProvider;
  now?: () => number;
  guard?: ContactGuard;
};

export function createContactRouter({
  provider = createContactProvider,
  now = Date.now,
  guard = new ContactGuard(),
}: ContactRouterOptions = {}) {
  return createRouter({
    submit: publicQuery
      .use(async ({ ctx, next }) => {
        if (!guard.allowAttempt(ctx.clientIp, now())) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "Recibimos varios envíos seguidos. Espera unos minutos e inténtalo de nuevo.",
          });
        }
        const result = await next();
        // Zod puede incluir claves arbitrarias del cliente en su mensaje de error.
        if (!result.ok && result.error.cause instanceof ZodError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Revisa los datos del formulario e inténtalo de nuevo.",
          });
        }
        return result;
      })
      .input(contactSchema)
      .mutation(async ({ input }): Promise<ContactResult> => {
        const submittedAt = now();
        const age = submittedAt - input.t;
        if (age < 2000 || age > 24 * 60 * 60 * 1000) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "El formulario se envió demasiado rápido o ha caducado. Vuelve a abrirlo e inténtalo de nuevo.",
          });
        }

        const key = guard.reserve(input, submittedAt);
        if (!key) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "Esta consulta ya se ha enviado o está en proceso. Espera unos minutos antes de repetirla.",
          });
        }

        try {
          await provider().send(input, key);
        } catch (error) {
          // Los reintentos conservan la misma clave de idempotencia del proveedor.
          guard.release(key);
          if (error instanceof ContactProviderError) {
            throw new TRPCError({
              code:
                error.kind === "unavailable"
                  ? "SERVICE_UNAVAILABLE"
                  : error.kind === "timeout"
                    ? "TIMEOUT"
                    : "BAD_GATEWAY",
              message: error.message,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "No pudimos confirmar el envío de tu consulta. Inténtalo de nuevo más tarde.",
          });
        }

        return { ok: true, forwarded: true };
      }),
  });
}

export const contactRouter = createContactRouter();
