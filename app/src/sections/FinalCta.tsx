import { Reveal } from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";

/**
 * SECCIÓN 08 — CTA FINAL
 * Inversión total: fondo negro, tipografía blanca, un solo camino.
 */
export default function FinalCta() {
  const ref = useInView<HTMLElement>(0.15);

  return (
    <section
      id="conversacion"
      ref={ref}
      className="rv-observe scroll-mt-16 bg-black px-5 py-24 text-white sm:px-8 lg:py-36"
      aria-labelledby="cta-title"
    >
      <Reveal variant="up">
        <p className="mono-label text-white/50">
          <span className="text-red">06</span> / Conversación
        </p>
      </Reveal>

      <h2 id="cta-title" className="display-hero mt-8">
        <Reveal variant="line" delay={60}>
          ¿Qué podría
        </Reveal>
        <Reveal variant="line" delay={180} className="lg:pl-[0.8em]">
          funcionar
        </Reveal>
        <Reveal variant="line" delay={300}>
          <span className="inline-block bg-red px-[0.12em] text-white">
            mejor?
          </span>
        </Reveal>
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <Reveal variant="up" delay={420} className="lg:col-span-5">
          <p className="body-text text-white/70">
            Cuéntanos qué problema tienes, qué te está quitando tiempo o qué
            te gustaría construir.
          </p>
          <p className="body-text mt-4 text-white/70">
            No necesitas llegar con una solución definida. Podemos empezar por
            entender el problema.
          </p>
        </Reveal>

        <Reveal
          variant="up"
          delay={520}
          className="flex flex-col items-start justify-end lg:col-span-7 lg:items-end"
        >
          <a
            href="#contacto"
            data-magnetic
            data-cursor="Empezar"
            className="btn-sweep btn-sweep--ink mono-label inline-flex h-14 items-center justify-center border border-white bg-white px-9 text-black"
          >
            Hablemos de tu proyecto ↗
          </a>
          <p className="mono-data mt-5 text-white/50">
            No necesitas tenerlo todo resuelto para empezar la conversación.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
