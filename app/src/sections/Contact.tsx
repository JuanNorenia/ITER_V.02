import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";
import { site } from "@/config/site";
import { trpc } from "@/providers/trpc";
import { useLocale } from "@/providers/LocaleProvider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { contactFailureMessage, contactUnavailableMessage, publicContactError } from "@/lib/contactErrors";
import {
  contactSchema,
  NEED_TYPES,
  BUDGET_RANGES,
  type ContactInput,
} from "@contracts/contact";

type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<keyof ContactInput, string>>;

const inputCls =
  "min-w-0 w-full border border-line bg-white px-3 py-3 font-display text-lg outline-none transition-colors placeholder:text-smoke/60 hover:border-ink/50 focus:border-red focus:ring-2 focus:ring-red/20 data-[invalid=true]:border-red";
const labelCls = "mono-label text-smoke";
const errorCls = "mono-data mt-2 border-l-2 border-red pl-2 text-ink";

/**
 * Contacto independiente: validación compartida y confirmación real del proveedor.
 * Los datos del formulario permanecen en memoria durante esta interacción.
 */
export default function Contact({ initialNeed = "" }: { initialNeed?: string }) {
  const { t } = useLocale();
  const reduced = usePrefersReducedMotion();
  const ref = useInView<HTMLElement>(0.06);
  const successRef = useRef<HTMLDivElement>(null);
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
    tipoNecesidad: NEED_TYPES.some(need => need.value === initialNeed) ? initialNeed : "",
    presupuesto: "",
    consentimiento: false,
    website: "", // honeypot
  });

  const mutation = trpc.contact.submit.useMutation();

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendingRef.current) return;
    const form = e.currentTarget;

    const payload = { ...values, t: mountedAt.current };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInput;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      const key = Object.keys(next)[0];
      const first = key ? form.elements.namedItem(key) : null;
      if (first instanceof HTMLElement) {
        first.focus({ preventScroll: true });
        first.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "center" });
      }
      return;
    }

    if (!site.canSubmitContact) {
      setStatus("error");
      setServerMsg(contactUnavailableMessage);
      return;
    }

    sendingRef.current = true;
    setStatus("sending");
    setServerMsg("");
    try {
      const result = await mutation.mutateAsync(parsed.data);
      if (result.ok !== true || result.forwarded !== true) {
        throw new Error(contactFailureMessage);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerMsg(publicContactError(err));
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
    setServerMsg("");
    mountedAt.current = Date.now();
    setStatus("idle");
  };

  return (
    <section
      id="contacto"
      ref={ref}
      className="rv-observe relative scroll-mt-16 px-5 pb-20 pt-8 sm:px-8 lg:pb-28 lg:pt-12"
      aria-labelledby="contacto-title"
    >
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
        <div className="min-w-0 self-start bg-paper p-4 lg:col-span-5 lg:p-6">
          <Reveal variant="up">
            <p className="mono-label text-smoke">
              <span className="bg-red px-1 text-ink">07</span> / {t("Contacto")}
            </p>
          </Reveal>
          <Reveal variant="line" className="mt-6">
            <h1 id="contacto-title" className="display-section">
              {t("Cuéntanos qué necesita mejorar.")}
            </h1>
          </Reveal>
          <Reveal variant="up" delay={140} className="mt-6 max-w-md">
            <p className="body-text text-smoke">
              {t("Cuéntanos qué está pasando. En ITER empezamos por entenderlo.")}
            </p>
          </Reveal>
          {site.contactEmail && (
            <Reveal variant="up" delay={200} className="mt-8">
              <p className="mono-label text-smoke">{t("También por correo")}</p>
              <a
                href={`mailto:${site.contactEmail}`}
                className="link-line display-sub mt-2 inline-block break-all"
              >
                {site.contactEmail}
              </a>
            </Reveal>
          )}
        </div>

        <div className="min-w-0 lg:col-span-7">
          {status === "success" ? (
            <div
              ref={successRef}
              role="status"
              tabIndex={-1}
              className="flex min-h-[420px] min-w-0 flex-col justify-center border-l-4 border-l-red border-y border-r border-black bg-paper p-5 sm:p-8 lg:p-12"
            >
              <p className="display-section">{t("Recibido.")}</p>
              <p className="body-text mt-6 max-w-md text-smoke">
                {t("Gracias por contarnos qué necesitas. Revisaremos tu mensaje para entender cómo podemos ayudarte.")}
              </p>

              <button
                type="button"
                onClick={reset}
                className="btn-sweep btn-sweep--paper mono-label mt-10 inline-flex min-h-12 w-fit max-w-full items-center border border-black bg-black px-7 py-3 text-white"
              >
                {t("Enviar otra consulta")}
              </button>
            </div>
          ) : (
            <Reveal variant="up" delay={120}>
              <form onSubmit={onSubmit} noValidate aria-busy={status === "sending"} className="border border-line border-t-2 border-t-red bg-paper p-5 sm:p-8">
                <fieldset disabled={status === "sending"} className="min-w-0 space-y-8">
                {/* Honeypot: invisible para humanos, irresistible para bots */}
                <div
                  aria-hidden="true"
                  className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
                >
                  <label>
                    {t("Sitio web")}
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
                      {t("Nombre *")}
                    </label>
                    <input
                      id="f-nombre"
                      name="nombre"
                      required
                      maxLength={80}
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
                        {t(errors.nombre)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="f-email" className={labelCls}>
                      {t("Correo electrónico *")}
                    </label>
                    <input
                      id="f-email"
                      name="email"
                      required
                      maxLength={120}
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
                        {t(errors.email)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="f-empresa" className={labelCls}>
                      {t("Empresa o proyecto")}
                    </label>
                    <input
                      id="f-empresa"
                      name="empresa"
                      maxLength={120}
                      type="text"
                      autoComplete="organization"
                      value={values.empresa}
                      onChange={set("empresa")}
                      className={inputCls}
                      aria-invalid={!!errors.empresa}
                      aria-describedby={errors.empresa ? "e-empresa" : undefined}
                    />
                    {errors.empresa && (
                      <p id="e-empresa" role="alert" className={errorCls}>{t(errors.empresa)}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="f-tipo" className={labelCls}>
                      {t("Tipo de necesidad")}
                    </label>
                    <select
                      id="f-tipo"
                      name="tipoNecesidad"
                      value={values.tipoNecesidad}
                      onChange={set("tipoNecesidad")}
                      className={`${inputCls} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 fill=%22none%22 stroke=%22%23000%22 stroke-width=%221.5%22/%3E%3C/svg%3E')] bg-[position:right_0.25rem_center] bg-no-repeat pr-8`}
                    >
                      <option value="">{t("Selecciona una opción")}</option>
                      {NEED_TYPES.map((n) => (
                        <option key={n.value} value={n.value}>
                          {t(n.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="f-mensaje" className={labelCls}>
                    {t("¿Qué necesitas resolver? *")}
                  </label>
                  <textarea
                    id="f-mensaje"
                    name="mensaje"
                    required
                    maxLength={2000}
                    rows={5}
                    value={values.mensaje}
                    onChange={set("mensaje")}
                    placeholder={t("Cuéntanos qué ocurre, cómo lo resuelves hoy y qué te gustaría mejorar.")}
                    className={`${inputCls} resize-y`}
                    data-invalid={!!errors.mensaje}
                    aria-invalid={!!errors.mensaje}
                    aria-describedby={errors.mensaje ? "e-mensaje" : undefined}
                  />
                  {errors.mensaje && (
                    <p id="e-mensaje" role="alert" className={errorCls}>
                      {t(errors.mensaje)}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="f-presupuesto" className={labelCls}>
                    {t("Presupuesto estimado")}
                  </label>
                  <select
                    id="f-presupuesto"
                    name="presupuesto"
                    value={values.presupuesto}
                    onChange={set("presupuesto")}
                    className={`${inputCls} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22%3E%3Cpath d=%22M1 1l5 5 5-5%22 fill=%22none%22 stroke=%22%23000%22 stroke-width=%221.5%22/%3E%3C/svg%3E')] bg-[position:right_0.25rem_center] bg-no-repeat pr-8`}
                  >
                    <option value="">{t("Selecciona un rango")}</option>
                    {BUDGET_RANGES.map((b) => (
                      <option key={b.value} value={b.value}>
                        {t(b.label)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="consentimiento"
                      required
                      checked={values.consentimiento}
                      onChange={set("consentimiento")}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--red)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
                      data-invalid={!!errors.consentimiento}
                      aria-invalid={!!errors.consentimiento}
                      aria-describedby={
                        errors.consentimiento ? "e-consent" : undefined
                      }
                    />
                    <span className="body-text text-sm">
                      {t("Autorizo el tratamiento de mis datos personales para responder esta solicitud y gestionar el contacto, según la")}{" "}
                      <button
                        type="button"
                        onClick={openPrivacy}
                        className="link-line font-medium underline"
                      >
                        {t("política de tratamiento de datos")}
                      </button>
                      . *
                    </span>
                  </label>
                  {errors.consentimiento && (
                    <p id="e-consent" role="alert" className={errorCls}>
                      {t(errors.consentimiento)}
                    </p>
                  )}
                </div>

                {status === "error" && (
                  <div
                    role="alert"
                    className="border border-black border-l-4 border-l-red bg-mist p-4"
                  >
                    <p className="mono-label">{t("No se pudo enviar")}</p>
                    <p className="body-text mt-2 text-sm">{t(serverMsg)}</p>
                    <p className="body-text mt-2 text-sm text-smoke">
                      {t("Tus datos siguen en el formulario. Inténtalo de nuevo en unos minutos.")}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  data-magnetic
                  data-cursor={t("Enviar")}
                  className="btn-sweep btn-sweep--red red-edge-link mono-label inline-flex min-h-14 w-full max-w-full items-center justify-center border border-red bg-red px-7 py-4 text-center text-ink transition-opacity disabled:opacity-60 sm:w-auto"
                >
                  {status === "sending" && <span className="contact-spinner mr-3 inline-block h-4 w-4 border-2 border-ink border-r-transparent" aria-hidden="true" />}
                  {t(status === "sending" ? "Enviando tu consulta…" : "Enviar consulta ↗")}
                </button>

                <p className="mono-data text-smoke">
                  {t("Tus datos se usan únicamente para responder tu solicitud y gestionar el contacto. Ninguna casilla viene marcada por defecto.")}
                </p>
                </fieldset>
              </form>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
