import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";
import { site } from "@/config/site";
import { trpc } from "@/providers/trpc";
import {
  contactSchema,
  NEED_TYPES,
  BUDGET_RANGES,
  type ContactInput,
} from "@contracts/contact";

type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<keyof ContactInput, string>>;

const inputCls =
  "w-full border-b border-ink/30 bg-transparent py-3 font-display text-lg outline-none transition-colors placeholder:text-line focus:border-black";
const labelCls = "mono-label text-smoke";
const errorCls = "mono-data mt-2 text-red";

/**
 * SECCIÓN 09 — FORMULARIO DE CONTACTO
 * Envío real vía tRPC → validación zod en cliente y servidor →
 * almacenamiento del lead + reenvío opcional si hay proveedor configurado.
 */
export default function Contact() {
  const ref = useInView<HTMLElement>(0.06);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverMsg, setServerMsg] = useState("");
  const mountedAt = useRef(Date.now());
  const sendingRef = useRef(false);

  const [values, setValues] = useState({
    nombre: "",
    email: "",
    empresa: "",
    mensaje: "",
    tipoNecesidad: "",
    presupuesto: "",
    consentimiento: false,
    website: "", // honeypot
  });

  const mutation = trpc.contact.submit.useMutation();

  // Las filas de «Qué hacemos» preseleccionan el tipo de necesidad
  useEffect(() => {
    const onNeed = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setValues((v) => ({ ...v, tipoNecesidad: id }));
    };
    window.addEventListener("iter:need", onNeed);
    return () => window.removeEventListener("iter:need", onNeed);
  }, []);

  const set =
    (key: keyof typeof values) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const v =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setValues((prev) => ({ ...prev, [key]: v }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const openPrivacy = () =>
    window.dispatchEvent(new CustomEvent("iter:privacy"));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRef.current) return;

    const payload = { ...values, t: mountedAt.current };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInput;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      const first = document.querySelector("[data-invalid='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    sendingRef.current = true;
    setStatus("sending");
    setServerMsg("");
    try {
      await mutation.mutateAsync(parsed.data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerMsg(
        err instanceof Error && err.message
          ? err.message
          : "No pudimos enviar tu consulta. Inténtalo de nuevo.",
      );
    } finally {
      sendingRef.current = false;
    }
  };

  const reset = () => {
    setValues({
      nombre: "",
      email: "",
      empresa: "",
      mensaje: "",
      tipoNecesidad: "",
      presupuesto: "",
      consentimiento: false,
      website: "",
    });
    setErrors({});
    mountedAt.current = Date.now();
    setStatus("idle");
  };

  return (
    <section
      id="contacto"
      ref={ref}
      className="rv-observe scroll-mt-16 px-5 py-20 sm:px-8 lg:py-28"
      aria-labelledby="contacto-title"
    >
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal variant="up">
            <p className="mono-label text-smoke">
              <span className="text-red">07</span> / Contacto
            </p>
          </Reveal>
          <Reveal variant="line" className="mt-6">
            <h2 id="contacto-title" className="display-section">
              Empecemos por el problema.
            </h2>
          </Reveal>
          <Reveal variant="up" delay={140} className="mt-6 max-w-md">
            <p className="body-text text-smoke">
              Cuéntanos qué está pasando. Nosotros empezamos por entenderlo.
            </p>
          </Reveal>
          {site.contactEmail && (
            <Reveal variant="up" delay={200} className="mt-8">
              <p className="mono-label text-smoke">También por correo</p>
              <a
                href={`mailto:${site.contactEmail}`}
                className="link-line display-sub mt-2 inline-block"
              >
                {site.contactEmail}
              </a>
            </Reveal>
          )}
        </div>

        <div className="lg:col-span-7">
          {status === "success" ? (
            <div
              role="status"
              className="flex min-h-[420px] flex-col justify-center border border-black p-8 lg:p-12"
            >
              <p className="display-section">Recibido.</p>
              <p className="body-text mt-6 max-w-md text-smoke">
                Gracias por contarnos qué necesitas. Revisaremos tu mensaje
                para entender cómo podemos ayudarte.
              </p>
              <p className="mono-data mt-6 text-smoke">
                Tu consulta quedó registrada. Te respondemos al correo que
                compartiste.
              </p>
              <button
                type="button"
                onClick={reset}
                className="btn-sweep btn-sweep--paper mono-label mt-10 inline-flex h-12 w-fit items-center border border-black bg-black px-7 text-white"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <Reveal variant="up" delay={120}>
              <form onSubmit={onSubmit} noValidate className="space-y-8">
                {/* Honeypot: invisible para humanos, irresistible para bots */}
                <div
                  aria-hidden="true"
                  className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
                >
                  <label>
                    Sitio web
                    <input
                      type="text"
                      name="website"
                      value={values.website}
                      onChange={set("website")}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="f-nombre" className={labelCls}>
                      Nombre *
                    </label>
                    <input
                      id="f-nombre"
                      type="text"
                      autoComplete="name"
                      value={values.nombre}
                      onChange={set("nombre")}
                      className={inputCls}
                      data-invalid={!!errors.nombre}
                      aria-invalid={!!errors.nombre}
                      aria-describedby={errors.nombre ? "e-nombre" : undefined}
                    />
                    {errors.nombre && (
                      <p id="e-nombre" role="alert" className={errorCls}>
                        {errors.nombre}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="f-email" className={labelCls}>
                      Correo electrónico *
                    </label>
                    <input
                      id="f-email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={set("email")}
                      className={inputCls}
                      data-invalid={!!errors.email}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "e-email" : undefined}
                    />
                    {errors.email && (
                      <p id="e-email" role="alert" className={errorCls}>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="f-empresa" className={labelCls}>
                      Empresa o proyecto
                    </label>
                    <input
                      id="f-empresa"
                      type="text"
                      autoComplete="organization"
                      value={values.empresa}
                      onChange={set("empresa")}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="f-tipo" className={labelCls}>
                      Tipo de necesidad
                    </label>
                    <select
                      id="f-tipo"
                      value={values.tipoNecesidad}
                      onChange={set("tipoNecesidad")}
                      className={`${inputCls} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 fill=%22none%22 stroke=%22%23000%22 stroke-width=%221.5%22/%3E%3C/svg%3E')] bg-[position:right_0.25rem_center] bg-no-repeat pr-8`}
                    >
                      <option value="">Selecciona una opción</option>
                      {NEED_TYPES.map((n) => (
                        <option key={n.value} value={n.value}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="f-mensaje" className={labelCls}>
                    ¿Qué necesitas resolver? *
                  </label>
                  <textarea
                    id="f-mensaje"
                    rows={5}
                    value={values.mensaje}
                    onChange={set("mensaje")}
                    placeholder="Describe el problema, no la solución. Eso es nuestro trabajo."
                    className={`${inputCls} resize-y`}
                    data-invalid={!!errors.mensaje}
                    aria-invalid={!!errors.mensaje}
                    aria-describedby={errors.mensaje ? "e-mensaje" : undefined}
                  />
                  {errors.mensaje && (
                    <p id="e-mensaje" role="alert" className={errorCls}>
                      {errors.mensaje}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="f-presupuesto" className={labelCls}>
                    Presupuesto estimado
                  </label>
                  <select
                    id="f-presupuesto"
                    value={values.presupuesto}
                    onChange={set("presupuesto")}
                    className={`${inputCls} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 fill=%22none%22 stroke=%22%23000%22 stroke-width=%221.5%22/%3E%3C/svg%3E')] bg-[position:right_0.25rem_center] bg-no-repeat pr-8`}
                  >
                    <option value="">Selecciona un rango</option>
                    {BUDGET_RANGES.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={values.consentimiento}
                      onChange={set("consentimiento")}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none border border-ink bg-transparent transition-colors checked:border-red checked:bg-red"
                      data-invalid={!!errors.consentimiento}
                      aria-invalid={!!errors.consentimiento}
                      aria-describedby={
                        errors.consentimiento ? "e-consent" : undefined
                      }
                    />
                    <span className="body-text text-sm">
                      Autorizo el tratamiento de mis datos personales para
                      responder esta solicitud y gestionar el contacto, según
                      la{" "}
                      <button
                        type="button"
                        onClick={openPrivacy}
                        className="link-line font-medium underline"
                      >
                        política de tratamiento de datos
                      </button>
                      . *
                    </span>
                  </label>
                  {errors.consentimiento && (
                    <p id="e-consent" role="alert" className={errorCls}>
                      {errors.consentimiento}
                    </p>
                  )}
                </div>

                {status === "error" && (
                  <div
                    role="alert"
                    className="border border-black bg-mist p-4"
                  >
                    <p className="mono-label">No se pudo enviar</p>
                    <p className="body-text mt-2 text-sm">{serverMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  data-magnetic
                  data-cursor="Enviar"
                  className="btn-sweep btn-sweep--red mono-label inline-flex h-14 w-full items-center justify-center border border-black bg-black px-9 text-white transition-opacity disabled:opacity-60 sm:w-auto"
                >
                  {status === "sending" ? "Enviando…" : "Enviar mi consulta ↗"}
                </button>

                <p className="mono-data text-smoke">
                  Tus datos se usan únicamente para responder tu solicitud y
                  gestionar el contacto. Ninguna casilla viene marcada por
                  defecto.
                </p>
              </form>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
