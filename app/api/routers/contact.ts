import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "../middleware";
import { contactSchema, type ContactResult } from "@contracts/contact";
import { insertLead, markForwarded } from "../queries/leads";

/**
 * Router de contacto.
 *
 * Capa de envío desacoplada (configurable por variables de entorno):
 *  - CONTACT_FORWARD_URL  → reenvía el lead como JSON a ese webhook.
 *  - RESEND_API_KEY + CONTACT_TO + CONTACT_FROM → reenvía por correo vía Resend.
 * Si ninguna está configurada, el lead queda almacenado en la base de datos
 * (esa es la confirmación real de recepción) y `forwarded` llega en false.
 */

// ── Anti-spam: límite simple por IP (5 envíos / 10 min) ─────────────────────
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_HITS) {
    hits.set(ip, list);
    return false;
  }
  list.push(now);
  hits.set(ip, list);
  return true;
}

async function forwardLead(payload: Record<string, unknown>): Promise<boolean> {
  const webhook = process.env.CONTACT_FORWARD_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;

  try {
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });
      return res.ok;
    }
    if (resendKey && to && from) {
      const p = payload as {
        nombre: string;
        email: string;
        empresa?: string;
        mensaje: string;
        tipoNecesidad?: string;
        presupuesto?: string;
      };
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${resendKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: p.email,
          subject: `Nueva consulta ITER — ${p.nombre}`,
          text: [
            `Nombre: ${p.nombre}`,
            `Correo: ${p.email}`,
            `Empresa/proyecto: ${p.empresa || "—"}`,
            `Tipo de necesidad: ${p.tipoNecesidad || "—"}`,
            `Presupuesto: ${p.presupuesto || "—"}`,
            "",
            "¿Qué necesita resolver?",
            p.mensaje,
          ].join("\n"),
        }),
        signal: AbortSignal.timeout(6000),
      });
      return res.ok;
    }
  } catch {
    // El reenvío falló; el lead ya está almacenado. No exponemos datos en logs.
    console.warn("[contact] forwarding failed (lead stored)");
  }
  return false;
}

export const contactRouter = createRouter({
  submit: publicQuery
    .input(contactSchema)
    .mutation(async ({ input, ctx }): Promise<ContactResult> => {
      // Honeypot: bots que llenan el campo oculto se descartan en silencio.
      if (input.website) {
        return { ok: true, forwarded: false };
      }

      // Trampa de tiempo: un humano no completa el formulario en < 2 s.
      if (Date.now() - input.t < 2000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El envío fue demasiado rápido. Inténtalo de nuevo.",
        });
      }

      const ip =
        ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      if (!rateLimit(ip)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Recibimos varios envíos seguidos. Espera unos minutos e inténtalo de nuevo.",
        });
      }

      const userAgent = (
        ctx.req.headers.get("user-agent") ?? ""
      ).slice(0, 255);

      const leadId = await insertLead({
        nombre: input.nombre,
        email: input.email,
        empresa: input.empresa || null,
        mensaje: input.mensaje,
        tipoNecesidad: input.tipoNecesidad || null,
        presupuesto: input.presupuesto || null,
        userAgent,
      });

      const forwarded = await forwardLead({
        nombre: input.nombre,
        email: input.email,
        empresa: input.empresa || "",
        mensaje: input.mensaje,
        tipoNecesidad: input.tipoNecesidad || "",
        presupuesto: input.presupuesto || "",
      });
      if (forwarded) await markForwarded(leadId);

      return { ok: true, forwarded };
    }),
});
