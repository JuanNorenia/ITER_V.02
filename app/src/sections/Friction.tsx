import { Reveal } from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";
import { useLocale } from "@/providers/LocaleProvider";

const situations = [
  {
    n: "01",
    title: "Demasiados pasos",
    text: "Procesos que obligan a repetir tareas, copiar información o hacer manualmente lo que podría resolverse de otra manera.",
  },
  {
    n: "02",
    title: "Herramientas desconectadas",
    text: "Sistemas que no se comunican, información duplicada y decisiones tomadas con datos incompletos.",
  },
  {
    n: "03",
    title: "Soluciones que no encajan",
    text: "Herramientas que prometen resolverlo todo, pero no se adaptan al funcionamiento real del negocio.",
  },
];

/**
 * SECCIÓN 03 — LA FRICCIÓN
 * Composición editorial de números grandes; el hover barre la fila (CUT).
 */
export default function Friction() {
  const { t } = useLocale();
  const ref = useInView<HTMLElement>(0.08);

  return (
    <section
      id="friccion"
      ref={ref}
      className="rv-observe scroll-mt-16 px-5 py-20 sm:px-8 lg:py-28"
      aria-labelledby="friccion-title"
    >
      <Reveal variant="up">
        <p className="mono-label text-smoke">
          <span className="text-red">01</span> / {t("La fricción")}
        </p>
      </Reveal>

      <Reveal variant="line" className="mt-6 max-w-5xl">
        <h2 id="friccion-title" className="display-section">
          {t("El problema no siempre es el que parece.")}
        </h2>
      </Reveal>

      <div className="mt-8 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-2">
        <Reveal variant="up" delay={120}>
          <p className="body-text">
            {t(
              "A veces no necesitas otra herramienta. Necesitas que las que ya tienes funcionen mejor juntas."
            )}
          </p>
        </Reveal>
        <Reveal variant="up" delay={220}>
          <p className="body-text">
            {t(
              "A veces no necesitas más personal. Necesitas eliminar un proceso que consume tiempo sin aportar valor. Y a veces sí necesitas construir algo nuevo."
            )}
          </p>
        </Reveal>
      </div>

      <Reveal variant="up" delay={120} className="mt-6">
        <p className="body-text font-medium">
          {t("Primero entendemos el problema. Después encontramos la forma.")}
        </p>
      </Reveal>

      <div className="mt-16">
        {situations.map((s, i) => (
          <Reveal key={s.n} variant="up" delay={i * 110}>
            <article
              className="group relative border-t border-line py-8 transition-colors duration-300 lg:py-10"
              data-cursor={t("Fricción")}
            >
              <div
                className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-black transition-transform duration-500 ease-iter group-hover:scale-x-100"
                aria-hidden="true"
              />
              <div className="relative grid grid-cols-12 items-start gap-4 px-1 transition-colors duration-300 group-hover:text-white">
                <span
                  className="font-display col-span-3 text-6xl font-black leading-none tracking-tighter text-line transition-colors duration-300 group-hover:text-red sm:col-span-2 sm:text-8xl"
                  aria-hidden="true"
                >
                  {s.n}
                </span>
                <div className="col-span-9 min-w-0 sm:col-span-10 lg:col-span-8">
                  <h3 className="display-sub break-words uppercase">
                    {t(s.title)}
                  </h3>
                  <p className="body-text mt-3 max-w-xl text-smoke transition-colors duration-300 group-hover:text-white/70">
                    {t(s.text)}
                  </p>
                </div>
                <span
                  className="mono-label col-span-12 mt-2 opacity-0 transition-opacity duration-300 group-hover:opacity-60 lg:col-span-2 lg:mt-0 lg:text-right"
                  aria-hidden="true"
                >
                  {t("Fricción →")}
                </span>
              </div>
            </article>
          </Reveal>
        ))}
        <div className="border-t border-line" />
      </div>

      <div className="mt-20 lg:mt-28">
        <Reveal variant="line">
          <p className="display-section max-w-6xl">
            {t("No añadimos tecnología al problema.")}
          </p>
        </Reveal>
        <Reveal variant="line" delay={140} className="lg:pl-[12vw]">
          <p className="display-section max-w-6xl text-smoke">
            {t("Encontramos qué necesita cambiar.")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
