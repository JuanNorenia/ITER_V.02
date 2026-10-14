import { z } from "zod";
import {
  BUDGET_RANGES,
  NEED_TYPES,
  type ContactInput,
} from "../../contracts/contact";

export const CONTACT_PROVIDER_TIMEOUT_MS = 6000;

export interface ContactProvider {
  send(input: ContactInput, idempotencyKey: string): Promise<void>;
}

export class ContactProviderError extends Error {
  constructor(readonly kind: "unavailable" | "failed" | "timeout") {
    super(
      kind === "unavailable"
        ? "El servicio de contacto no está configurado. No se ha enviado tu consulta. Inténtalo más tarde."
        : kind === "timeout"
          ? "El proveedor tardó demasiado en responder. No pudimos confirmar el envío. Inténtalo de nuevo."
          : "No pudimos confirmar el envío con el proveedor de correo. Inténtalo de nuevo más tarde."
    );
    this.name = "ContactProviderError";
  }
}

/** Configuración perezosa: un proveedor ausente no impide arrancar la API. */
export function createContactProvider(
  config: Record<string, string | undefined> = process.env
): ContactProvider {
  const apiKey = config.RESEND_API_KEY?.trim();
  const from = config.CONTACT_FROM_EMAIL?.trim();
  const to = config.CONTACT_TO_EMAIL?.trim();
  const email = z.email();
  if (
    config.CONTACT_PROVIDER !== "resend" ||
    !apiKey ||
    /[\r\n]/u.test(apiKey) ||
    !email.safeParse(from).success ||
    !email.safeParse(to).success
  ) {
    throw new ContactProviderError("unavailable");
  }

  return {
    async send(input, idempotencyKey) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        CONTACT_PROVIDER_TIMEOUT_MS
      );
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          redirect: "error",
          headers: {
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
            "idempotency-key": `contact-${idempotencyKey}`,
          },
          body: JSON.stringify({
            from,
            to: [to],
            reply_to: input.email.toLowerCase(),
            subject: "Nueva consulta desde ITER",
            text: [
              `Nombre: ${input.nombre}`,
              `Correo: ${input.email.toLowerCase()}`,
              `Empresa/proyecto: ${input.empresa || "—"}`,
              `Tipo de necesidad: ${NEED_TYPES.find(n => n.value === input.tipoNecesidad)?.label || "—"}`,
              `Presupuesto: ${BUDGET_RANGES.find(b => b.value === input.presupuesto)?.label || "—"}`,
              "Autorización de tratamiento de datos: Sí",
              "",
              "¿Qué necesita resolver?",
              input.mensaje,
            ].join("\n"),
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw new ContactProviderError("failed");
        }
        const confirmation: unknown = await response.json();
        if (
          !confirmation ||
          typeof confirmation !== "object" ||
          !("id" in confirmation) ||
          typeof confirmation.id !== "string" ||
          !confirmation.id.trim()
        ) {
          throw new ContactProviderError("failed");
        }
      } catch {
        // No se propagan respuestas/errores externos: podrían contener datos o secretos.
        throw new ContactProviderError(
          controller.signal.aborted ? "timeout" : "failed"
        );
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
