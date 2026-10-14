import { z } from "zod";

/**
 * Contrato compartido del formulario de contacto de ITER.
 * Lo usan el cliente (validación inmediata) y el servidor (validación final).
 */

export const NEED_TYPES = [
  { value: "software", label: "Software o producto digital" },
  { value: "automatizacion", label: "Automatización" },
  { value: "integracion", label: "Integración de herramientas" },
  { value: "digitalizacion", label: "Digitalización de procesos" },
  { value: "a-medida", label: "Solución a medida" },
  { value: "sin-definir", label: "Todavía no lo tengo claro" },
  { value: "otro", label: "Otro" },
] as const;

/** Rangos configurables de presupuesto (COP). Editar libremente. */
export const BUDGET_RANGES = [
  { value: "por-definir", label: "Por definir" },
  { value: "menos-5m", label: "Menos de $5 M COP" },
  { value: "5m-15m", label: "$5 M – $15 M COP" },
  { value: "15m-40m", label: "$15 M – $40 M COP" },
  { value: "mas-40m", label: "Más de $40 M COP" },
] as const;

const needValues = NEED_TYPES.map((n) => n.value) as [string, ...string[]];
const budgetValues = BUDGET_RANGES.map((b) => b.value) as [string, ...string[]];

export const contactSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Cuéntanos tu nombre (mínimo 2 caracteres).")
    .max(80, "El nombre es demasiado largo."),
  email: z
    .string()
    .trim()
    .min(1, "Necesitamos un correo para responderte.")
    .email("Ese correo no parece válido. Revísalo.")
    .max(120, "El correo es demasiado largo."),
  empresa: z
    .string()
    .trim()
    .max(120, "El nombre de la empresa es demasiado largo.")
    .optional()
    .or(z.literal("")),
  mensaje: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres).")
    .max(2000, "Máximo 2000 caracteres. Lo esencial es suficiente."),
  tipoNecesidad: z.enum(needValues).optional().or(z.literal("")),
  presupuesto: z.enum(budgetValues).optional().or(z.literal("")),
  consentimiento: z.literal(true, {
    message: "Necesitamos tu autorización para tratamiento de datos.",
  }),
  /** Honeypot: debe llegar vacío. Lo llenan los bots. */
  website: z.string().max(0).optional().or(z.literal("")),
  /** Marca de tiempo del cliente (ms). Anti envíos instantáneos. */
  t: z.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactResult = {
  ok: true;
  /** true si además de almacenarse se reenvió al proveedor configurado */
  forwarded: boolean;
};
