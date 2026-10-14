/**
 * Configuración central de ITER.
 * Los datos comerciales que aún no existen quedan vacíos y la UI
 * los oculta hasta que se configuren. Nunca inventar información.
 */
export const site = {
  name: "ITER",
  tagline: "Encontramos la forma.",
  concept: "El arte de encontrar la forma.",
  /** Correo oficial de contacto. Vacío = el enlace alternativo se oculta. */
  contactEmail: "",
  /** URL pública del sitio (para OG/canonical cuando exista dominio). */
  url: "",
  /** Redes sociales: añadir { label, href } cuando existan perfiles reales. */
  social: [] as { label: string; href: string }[],
  country: "Colombia",
} as const;

export const nav = [
  { index: "01", label: "Qué hacemos", href: "#que-hacemos" },
  { index: "02", label: "Cómo pensamos", href: "#metodo" },
  { index: "03", label: "Contacto", href: "#contacto" },
] as const;
