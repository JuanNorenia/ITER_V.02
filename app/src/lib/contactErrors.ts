export const contactUnavailableMessage =
  "El formulario necesita una API configurada para enviar consultas. No se ha enviado tu mensaje. Inténtalo más tarde.";
export const contactFailureMessage =
  "No pudimos enviar tu consulta. Inténtalo de nuevo.";

const publicErrors = new Set([
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
]);

export function publicContactError(error: unknown): string {
  return error instanceof Error && publicErrors.has(error.message)
    ? error.message
    : contactFailureMessage;
}
