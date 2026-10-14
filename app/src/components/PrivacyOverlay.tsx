import { useEffect, useRef, useState } from "react";

/**
 * Política de tratamiento de datos — DOCUMENTO PROVISIONAL.
 * Se abre desde el formulario y el footer mediante el evento «iter:privacy».
 * Marcado explícitamente como pendiente de revisión jurídica.
 */
export default function PrivacyOverlay() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("iter:privacy", onOpen);
    return () => window.removeEventListener("iter:privacy", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
      className="fixed inset-0 z-[60] overflow-y-auto bg-black text-white"
    >
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="flex items-start justify-between gap-6">
          <p className="mono-label text-white/50">
            Documento provisional — pendiente de revisión jurídica
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            className="mono-label border border-white px-4 py-2 transition-colors hover:bg-white hover:text-black"
          >
            Cerrar ✕
          </button>
        </div>

        <h2 id="privacy-title" className="display-section mt-10">
          Política de tratamiento de datos personales
        </h2>

        <div className="body-text mt-10 space-y-6 text-white/80">
          <p>
            Este es un documento provisional de la primera versión pública de
            ITER. Será reemplazado por una política definitiva revisada
            jurídicamente. No representa una certificación de cumplimiento.
          </p>
          <p>
            <strong className="text-white">Qué datos recogemos.</strong> Los
            que escribes en el formulario de contacto: nombre, correo
            electrónico, empresa o proyecto (si decides compartirlo) y la
            descripción de lo que necesitas resolver.
          </p>
          <p>
            <strong className="text-white">Para qué los usamos.</strong>{" "}
            Únicamente para responder tu solicitud y gestionar la conversación
            comercial que inicias. No los vendemos, no los compartimos con
            terceros ni los usamos para publicidad.
          </p>
          <p>
            <strong className="text-white">Cuánto los conservamos.</strong> El
            tiempo necesario para atender tu consulta. Si no hay una relación
            posterior, los eliminamos.
          </p>
          <p>
            <strong className="text-white">Tus derechos.</strong> Puedes pedir
            acceso, corrección o eliminación de tus datos en cualquier momento
            escribiéndonos por el mismo formulario.
          </p>
          <p>
            <strong className="text-white">Seguridad.</strong> Los datos se
            transmiten cifrados y se almacenan con acceso restringido. Las
            credenciales y claves del sistema nunca se exponen en el navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
