/**
 * Configuración central de ITER.
 * Los datos comerciales que aún no existen quedan vacíos y la UI
 * los oculta hasta que se configuren. Nunca inventar información.
 */
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/u, "");

export const site = {
  name: "ITER",
  tagline: "Encontramos la forma.",
  concept: "El arte de encontrar la forma.",
  /** Correo oficial de contacto. Vacío = el enlace alternativo se oculta. */
  contactEmail: (import.meta.env.VITE_CONTACT_EMAIL ?? "").trim(),
  /** URL pública del sitio (para OG/canonical cuando exista dominio). */
  url: (import.meta.env.VITE_SITE_URL ?? "").trim(),
  /** Origen público de la API externa. Sin claves privadas en variables VITE_. */
  apiBaseUrl,
  contactEndpoint: `${apiBaseUrl}/api/trpc`,
  canSubmitContact: import.meta.env.MODE !== "pages" || !!apiBaseUrl,
  /** Redes sociales: añadir { label, href } cuando existan perfiles reales. */
  social: [] as { label: string; href: string }[],
  country: "Colombia",
} as const;

export const nav = [
  { index: "01", label: "Qué hacemos", href: "/?section=que-hacemos" },
  { index: "02", label: "Cómo pensamos", href: "/?section=metodo" },
  { index: "03", label: "Contacto", href: "/contacto" },
] as const;
