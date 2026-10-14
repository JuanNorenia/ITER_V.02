export const homeSections = [
  "top",
  "friccion",
  "que-hacemos",
  "metodo",
  "principios",
  "para-quien",
  "conversacion",
] as const;

export function homeSectionPath(section: string): string {
  return `/?section=${encodeURIComponent(section)}`;
}

export function contactPath(need?: string): string {
  return need ? `/contacto?need=${encodeURIComponent(need)}` : "/contacto";
}

export function getHomeSection(search: string): string | undefined {
  const section = new URLSearchParams(search).get("section");
  return homeSections.find(id => id === section);
}
