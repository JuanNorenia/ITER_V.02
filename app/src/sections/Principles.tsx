import { Reveal } from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";
import { useLocale } from "@/providers/LocaleProvider";

const principles = [
  {
    n: "P.01",
    title: "Menos fricción",
    text: "Reducir pasos, errores y trabajo innecesario.",
  },
  {
    n: "P.02",
    title: "Tecnología con propósito",
    text: "Cada herramienta, función y decisión debe responder a una necesidad.",
  },
  {
    n: "P.03",
    title: "Construir contigo",
    text: "El cliente participa en el proceso. Entendemos el contexto juntos, evaluamos alternativas y construimos con objetivos claros.",
  },
];

/**
 * SECCIÓN 06 — NUESTRA FORMA DE PENSAR
 * Tres principios como piezas editoriales, no tarjetas.
 */
export default function Principles() {
  const { t } = useLocale();
  const ref = useInView<HTMLElement>(0.08);

  return (
    <section
      id="principios"
      ref={ref}
      className="rv-observe scroll-mt-16 break-words bg-mist px-5 py-20 sm:px-8 lg:py-28"
      aria-labelledby="principios-title"
    >
      <Reveal variant="up">
        <p className="mono-label text-smoke">
          <span className="text-red">04</span> / {t("Cómo pensamos")}
        </p>
      </Reveal>

      <Reveal variant="line" className="mt-6 max-w-6xl">
        <h2 id="principios-title" className="display-section">
          {t("No venimos a decirte que sí a todo.")}
        </h2>
      </Reveal>

      <div className="mt-8 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal variant="up" delay={120}>
          <p className="body-text">
            {t(
              "Queremos entender lo que necesitas, no solamente ejecutar lo que nos pides."
            )}
          </p>
        </Reveal>
        <Reveal variant="up" delay={200}>
          <p className="body-text text-smoke">
            {t(
              "Si existe una forma más simple de resolverlo, la vamos a explorar contigo. Si una herramienta que ya existe es suficiente, no vamos a construir otra por construirla. Y si realmente hace falta crear algo nuevo, vamos a encontrar la forma de hacerlo."
            )}
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-px bg-ink/15 lg:grid-cols-3">
        {principles.map((p, i) => (
          <Reveal key={p.n} variant="up" delay={i * 120} className="min-w-0">
            <article className="group flex h-full flex-col justify-between bg-mist p-6 transition-colors duration-300 hover:bg-black hover:text-white lg:min-h-[280px] lg:p-8">
              <div className="flex items-start justify-between">
                <span className="mono-label text-smoke group-hover:text-white/50">
                  {p.n}
                </span>
                <span
                  className="h-2.5 w-2.5 border border-current opacity-30 transition-all duration-300 group-hover:border-red group-hover:bg-red group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-14">
                <h3 className="display-sub uppercase">{t(p.title)}</h3>
                <p className="body-text mt-3 text-smoke group-hover:text-white/70">
                  {t(p.text)}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-12">
        <Reveal
          variant="line"
          className="col-span-12 min-w-0 lg:col-span-9 lg:col-start-4"
        >
          <p className="display-section">
            {t("Tu problema es el punto de partida.")}{" "}
            <span className="text-smoke">
              {t("Encontrar la forma correcta es nuestro trabajo.")}
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
