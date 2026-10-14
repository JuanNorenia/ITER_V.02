import { describe, expect, it } from "vitest";
import {
  contactFailureMessage,
  contactUnavailableMessage,
  publicContactError,
} from "./contactErrors";

describe("public contact errors", () => {
  it("allows only the known public messages through", () => {
    const safeMessages = [
      contactUnavailableMessage,
      contactFailureMessage,
      "El servicio de contacto no está configurado. No se ha enviado tu consulta. Inténtalo más tarde.",
      "El proveedor tardó demasiado en responder. No pudimos confirmar el envío. Inténtalo de nuevo.",
      "No pudimos confirmar el envío con el proveedor de correo. Inténtalo de nuevo más tarde.",
      "No pudimos confirmar el envío de tu consulta. Inténtalo de nuevo más tarde.",
      "Revisa los datos del formulario e inténtalo de nuevo.",
      "El formulario se envió demasiado rápido o ha caducado. Vuelve a abrirlo e inténtalo de nuevo.",
      "Esta consulta ya se ha enviado o está en proceso. Espera unos minutos antes de repetirla.",
      "Recibimos varios envíos seguidos. Espera unos minutos e inténtalo de nuevo.",
    ];

    for (const message of safeMessages) {
      expect(publicContactError(new Error(message))).toBe(message);
    }
  });

  it.each([
    undefined,
    null,
    "provider secret: sk_live_private",
    new Error("recipient: private@example.com"),
    new Error("stack trace with private data"),
    { message: contactUnavailableMessage },
  ])("maps unknown errors to the safe fallback", error => {
    expect(publicContactError(error)).toBe(contactFailureMessage);
  });
});
