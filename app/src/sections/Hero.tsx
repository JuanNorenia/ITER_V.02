import AsciiStudy from "@/components/AsciiStudy";
import { Reveal } from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";

/**
 * SECCIÓN 02 — HERO
 * Composición tipográfica asimétrica + estudio de movimiento ASCII.
 * La intervención memorable: «SER ASÍ?» sobre bloque negro (CUT).
 */
export default function Hero() {
  const ref = useInView<HTMLElement>(0.1);

  return (
    <section
      id="top"
      ref={ref}
      className="rv-observe flex min-h-svh flex-col px-5 pt-16 sm:px-8"
    >
      {/* Capa INFORMATION: llega después de la acción */}
      <div className="mono-label flex items-center justify-between border-b border-line py-3 text-smoke">
        <Reveal variant="cut" delay={900}>
          <p>ITER / Tecnología aplicada</p>
        </Reveal>
        <Reveal variant="cut" delay={1050} className="hidden sm:block">
          <p>
            System 001 — Question everything
            <span className="blink" aria-hidden="true">
              _
            </span>
          </p>
        </Reveal>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-10 py-8 lg:grid-cols-12 lg:gap-8 lg:py-4">
        <div className="flex flex-col justify-center lg:col-span-7">
          <h1 className="display-hero">
            <Reveal variant="line" delay={80}>
              ¿Y si no
            </Reveal>
            <Reveal variant="line" delay={200} className="lg:pl-[0.9em]">
              tuviera que
            </Reveal>
            <Reveal variant="line" delay={320}>
              <span className="inline-block bg-black px-[0.12em] text-white">
                ser así?
              </span>
            </Reveal>
          </h1>

          <Reveal variant="up" delay={520} className="mt-7 max-w-xl">
            <p className="display-sub">
              Encontramos mejores formas de resolver problemas reales con
              tecnología, diseño e ingeniería.
            </p>
          </Reveal>

          <Reveal variant="up" delay={620} className="mt-4 max-w-md">
            <p className="body-text text-smoke">
              Analizamos lo que no funciona, cuestionamos lo establecido y
              construimos soluciones que hacen las cosas más simples.
            </p>
          </Reveal>

          <Reveal variant="up" delay={720} className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#contacto"
                data-magnetic
                data-cursor="Hablemos"
                className="btn-sweep btn-sweep--paper mono-label inline-flex h-12 items-center justify-center border border-black bg-black px-7 text-white"
              >
                Cuéntanos qué necesitas ↗
              </a>
              <a
                href="#metodo"
                data-magnetic
                className="btn-sweep btn-sweep--ink mono-label inline-flex h-12 items-center justify-center border border-black px-7 text-ink"
              >
                Así trabajamos ↓
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal
          variant="up"
          delay={450}
          className="flex flex-col justify-center lg:col-span-5"
        >
          <AsciiStudy className="h-[320px] w-full sm:h-[380px] lg:h-[56vh]" />
          <p className="mono-data mt-3 text-smoke">
            Fig. 01 — El movimiento como sistema: construir, desplazar,
            sustraer. Sin imágenes; solo tipografía en tiempo real.
          </p>
        </Reveal>
      </div>

      <div className="mono-label flex items-center justify-between border-t border-line py-3 text-smoke">
        <p>V.01 — Versión pública provisional</p>
        <p className="hidden sm:block">Desliza para recorrer el sistema ↓</p>
      </div>
    </section>
  );
}
