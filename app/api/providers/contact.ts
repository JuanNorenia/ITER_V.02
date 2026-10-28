import { z } from "zod";
import nodemailer from "nodemailer";
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
  readonly kind: "unavailable" | "failed" | "timeout";
  constructor(kind: "unavailable" | "failed" | "timeout") {
    super(
      kind === "unavailable"
        ? "El servicio de contacto no está configurado. No se ha enviado tu consulta. Inténtalo más tarde."
        : kind === "timeout"
          ? "El proveedor tardó demasiado en responder. No pudimos confirmar el envío. Inténtalo de nuevo."
          : "No pudimos confirmar el envío con el proveedor de correo. Inténtalo de nuevo más tarde."
    );
    this.kind = kind;
    this.name = "ContactProviderError";
  }
}

/** Configuración perezosa: un proveedor ausente no impide arrancar la API. */
export function createContactProvider(
  config: Record<string, string | undefined> = process.env
): ContactProvider {
  const kind =
    config.CONTACT_PROVIDER?.trim() ||
    (config.CONTACT_FORWARD_URL?.trim()
      ? "webhook"
      : config.CONTACT_FROM && config.CONTACT_TO
        ? "resend"
        : undefined);
  const apiKey = config.RESEND_API_KEY?.trim();
  const from = (config.CONTACT_FROM_EMAIL ?? config.CONTACT_FROM)?.trim();
  const to = (config.CONTACT_TO_EMAIL ?? config.CONTACT_TO)?.trim();
  const email = z.email();
  const smtpHost = config.SMTP_HOST?.trim() || "smtp.hostinger.com";
  const smtpPort = Number(config.SMTP_PORT?.trim() || "465");
  const smtpUser = config.SMTP_USER?.trim();
  const smtpPassword = config.SMTP_PASSWORD;
  const smtpSecure =
    config.SMTP_SECURE?.trim().toLowerCase() === "true" ||
    (!config.SMTP_SECURE?.trim() && smtpPort === 465);
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  let endpoint = "https://api.resend.com/emails";
  let smtpTransport: ReturnType<typeof nodemailer.createTransport> | undefined;
  if (kind === "webhook") {
    try {
      const url = new URL(config.CONTACT_FORWARD_URL?.trim() ?? "");
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.hash
      ) {
        throw new Error("Invalid webhook URL");
      }
      endpoint = url.href;
    } catch {
      throw new ContactProviderError("unavailable");
    }
  } else if (kind === "smtp") {
    if (
      !smtpHost ||
      /[^\w.-]/u.test(smtpHost) ||
      !Number.isInteger(smtpPort) ||
      smtpPort < 1 ||
      smtpPort > 65535 ||
      !smtpUser ||
      !smtpPassword ||
      !email.safeParse(from).success ||
      !email.safeParse(to).success
    ) {
      throw new ContactProviderError("unavailable");
    }
    smtpTransport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPassword },
      connectionTimeout: CONTACT_PROVIDER_TIMEOUT_MS,
      greetingTimeout: CONTACT_PROVIDER_TIMEOUT_MS,
      socketTimeout: CONTACT_PROVIDER_TIMEOUT_MS,
    });
  } else if (
    kind !== "resend" ||
    !apiKey ||
    /[\r\n]/u.test(apiKey) ||
    !email.safeParse(from).success ||
    !email.safeParse(to).success
  ) {
    throw new ContactProviderError("unavailable");
  } else {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return {
    async send(input, idempotencyKey) {
      const messageText = [
        `Nombre: ${input.nombre}`,
        `Correo: ${input.email.toLowerCase()}`,
        `Empresa/proyecto: ${input.empresa || "—"}`,
        `Tipo de necesidad: ${NEED_TYPES.find(n => n.value === input.tipoNecesidad)?.label || "—"}`,
        `Presupuesto: ${BUDGET_RANGES.find(b => b.value === input.presupuesto)?.label || "—"}`,
        "Autorización de tratamiento de datos: Sí",
        "",
        "¿Qué necesita resolver?",
        input.mensaje,
      ].join("\n");

      if (kind === "smtp") {
        if (!smtpTransport) throw new ContactProviderError("unavailable");
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            smtpTransport.sendMail({
              from,
              to,
              replyTo: input.email.toLowerCase(),
              subject: "Nueva consulta desde ITER",
              text: messageText,
              headers: { "X-Contact-Idempotency-Key": idempotencyKey },
            }),
            new Promise<never>((_, reject) => {
              timeout = setTimeout(
                () => reject(new ContactProviderError("timeout")),
                CONTACT_PROVIDER_TIMEOUT_MS
              );
            }),
          ]);
        } catch (error) {
          if (error instanceof ContactProviderError) throw error;
          throw new ContactProviderError("failed");
        } finally {
          if (timeout) clearTimeout(timeout);
          smtpTransport.close();
        }
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        CONTACT_PROVIDER_TIMEOUT_MS
      );
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          redirect: "error",
          headers: {
            ...headers,
            "idempotency-key": `contact-${idempotencyKey}`,
          },
          body: JSON.stringify(
            kind === "webhook"
              ? {
                  nombre: input.nombre,
                  email: input.email.toLowerCase(),
                  empresa: input.empresa || "",
                  mensaje: input.mensaje,
                  tipoNecesidad: input.tipoNecesidad || "",
                  presupuesto: input.presupuesto || "",
                }
              : {
                  from,
                  to: [to],
                  reply_to: input.email.toLowerCase(),
                  subject: "Nueva consulta desde ITER",
                  text: messageText,
                }
          ),
          signal: controller.signal,
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw new ContactProviderError("failed");
        }
        if (kind === "webhook") {
          await response.body?.cancel();
          return;
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
