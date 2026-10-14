import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";
import { useLocale } from "@/providers/LocaleProvider";

const steps = [
  {
    n: "01",
    title: "Entender",
    text: "Escuchamos, observamos el contexto, identificamos las personas implicadas y entendemos qué está fallando realmente.",
  },
  {
    n: "02",
    title: "Cuestionar",
    text: "Revisamos los supuestos, detectamos pasos innecesarios y preguntamos por qué las cosas se hacen de determinada manera.",
  },
  {
    n: "03",
    title: "Recomponer",
    text: "Exploramos alternativas. Comparamos construir, integrar, adaptar, automatizar o simplificar.",
  },
  {
    n: "04",
    title: "Crear",
    text: "Implementamos la solución elegida con atención a la experiencia de uso, la calidad técnica y las necesidades reales.",
  },
  {
    n: "05",
    title: "Iterar",
    text: "Probamos, aprendemos, ajustamos y mejoramos con base en lo que sucede en la práctica.",
  },
];

/**
 * SECCIÓN 05 — MÉTODO ITER
 * Línea de proceso que se dibuja con el scroll; cada etapa se activa
 * al llegar al centro del viewport. En móvil: secuencia vertical.
 */
export default function Method() {
  const { t } = useLocale();
  const ref = useInView<HTMLElement>(0.05);
  const stepsRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Línea de progreso dibujada por el scroll
  useEffect(() => {
    const container = stepsRef.current;
    const fill = fillRef.current;
    if (!container || !fill) return;

    let raf = 0;
    const update = () => {
      const rect = container.getBoundingClientRect();
      const center = window.innerHeight * 0.55;
      const progress = Math.min(
        1,
        Math.max(0, (center - rect.top) / rect.height)
      );
      fill.style.transform = `scaleY(${progress})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Activación de etapas al cruzar el centro visual
  useEffect(() => {
    const container = stepsRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll("[data-step]"));
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.step));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="metodo"
      ref={ref}
      className="rv-observe scroll-mt-16 break-words px-5 py-20 sm:px-8 lg:py-28"
      aria-labelledby="metodo-title"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal variant="up">
              <p className="mono-label text-smoke">
                <span className="text-red">03</span> / {t("Método ITER")}
              </p>
            </Reveal>
            <Reveal variant="line" className="mt-6">
              <h2 id="metodo-title" className="display-section">
                {t("Cuestionar es el principio.")}
              </h2>
            </Reveal>
            <Reveal variant="up" delay={140} className="mt-6 max-w-md">
              <p className="body-text text-smoke">
                {t(
                  "No seguimos una receta idéntica para todos los problemas. Seguimos un proceso para encontrar la solución adecuada."
                )}
              </p>
            </Reveal>
            <Reveal variant="up" delay={220} className="mt-10">
              <p className="mono-label border border-ink px-4 py-3 tabular-nums">
                {t("Etapa")}{" "}
                <span className="text-red">
                  {String(active + 1).padStart(2, "0")}
                </span>{" "}
                / 05 — {t(steps[active].title)}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <div ref={stepsRef} className="relative pl-10 sm:pl-14">
            {/* Riel del proceso */}
            <div
              className="absolute bottom-4 left-[5px] top-4 w-px bg-line"
              aria-hidden="true"
            >
              <div
                ref={fillRef}
                className="h-full w-px origin-top bg-red"
                style={{ transform: "scaleY(0)" }}
              />
            </div>

            {steps.map((s, i) => {
              const isActive = i === active;
              return (
                <Reveal key={s.n} variant="up" delay={i * 80}>
                  <article
                    data-step={i}
                    className={`relative border-b border-line py-10 transition-opacity duration-500 first:pt-4 lg:py-12 ${
                      isActive ? "opacity-100" : "opacity-45"
                    }`}
                  >
                    <span
                      className={`absolute -left-10 top-5 flex h-3 w-3 items-center justify-center border transition-colors duration-300 sm:-left-14 lg:top-[3.4rem] ${
                        isActive ? "border-red bg-red" : "border-black bg-paper"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="flex items-baseline gap-4">
                      <span className="mono-label shrink-0 text-smoke">
                        {s.n}
                      </span>
                      <h3 className="display-sub min-w-0 uppercase">
                        {t(s.title)}
                      </h3>
                    </div>
                    <p className="body-text mt-3 max-w-lg text-smoke">
                      {t(s.text)}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal variant="line" className="mt-14">
            <p className="display-sub max-w-xl">
              {t("La mejor solución no es la que hace más.")}{" "}
              <span className="text-smoke">
                {t("Es la que resuelve mejor.")}
              </span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
