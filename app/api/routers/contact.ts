import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "../middleware";
import { contactSchema, type ContactResult } from "../../contracts/contact";
import { ContactGuard } from "../lib/contact-guard";
import {
  ContactProviderError,
  createContactProvider,
  type ContactProvider,
} from "../providers/contact";

type ContactRouterOptions = {
  guard?: ContactGuard;
  provider?: () => ContactProvider;
  now?: () => number;
};

export function createContactRouter({
  guard = new ContactGuard(),
  provider = createContactProvider,
  now = Date.now,
}: ContactRouterOptions = {}) {
  return createRouter({
    submit: publicQuery
      .use(async ({ ctx, next }) => {
        // También cuentan los intentos inválidos; no solo los mensajes enviados.
        if (!guard.allowAttempt(ctx.clientIp, now())) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "Recibimos varios envíos seguidos. Espera unos minutos e inténtalo de nuevo.",
          });
        }
        return next();
      })
      .input(contactSchema)
      .mutation(async ({ input }): Promise<ContactResult> => {
        const currentTime = now();
        const age = currentTime - input.t;
        if (age < 2000) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "El envío fue demasiado rápido o su fecha no es válida. Espera unos segundos e inténtalo de nuevo.",
          });
        }
        if (age > 24 * 60 * 60 * 1000) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "El formulario ha caducado. Recarga la página e inténtalo de nuevo.",
          });
        }

        let reservation: string | undefined;
        try {
          const sender = provider();
          reservation = guard.reserve(input, currentTime);
          if (!reservation) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message:
                "Esta consulta ya fue enviada o hay varios envíos en curso. Espera unos minutos antes de repetirla.",
            });
          }
          await sender.send(input, reservation);
          return { ok: true, forwarded: true };
        } catch (error) {
          if (reservation) guard.release(reservation);
          if (error instanceof TRPCError) throw error;
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
      }),
  });
}

export const contactRouter = createContactRouter();
