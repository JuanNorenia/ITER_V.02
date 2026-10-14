import type { ContactInput } from "../../contracts/contact";

export function validContact(now = Date.now()): ContactInput {
  return {
    nombre: "Persona de prueba",
    email: "persona@example.com",
    empresa: "Proyecto de prueba",
    mensaje: "Necesito integrar las herramientas de mi proyecto.",
    tipoNecesidad: "integracion",
    presupuesto: "por-definir",
    consentimiento: true,
    website: "",
    t: now - 5000,
  };
}
