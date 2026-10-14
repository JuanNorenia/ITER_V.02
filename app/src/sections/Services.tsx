import { Reveal } from "@/components/Reveal";
import { GlyphBuild, GlyphCut, GlyphForm, GlyphShift } from "@/components/Glyphs";
import { useInView } from "@/hooks/useInView";

const areas = [
  {
    id: "software",
    index: "S.01",
    Glyph: GlyphBuild,
    title: "Software y productos digitales",
    text: "Aplicaciones web, herramientas internas, plataformas y productos digitales diseñados para resolver necesidades concretas.",
  },
  {
    id: "automatizacion",
    index: "S.02",
    Glyph: GlyphShift,
    title: "Automatización e integración",
    text: "Conectamos herramientas, eliminamos tareas repetitivas y diseñamos flujos de trabajo más simples.",
  },
  {
    id: "digitalizacion",
    index: "S.03",
    Glyph: GlyphCut,
    title: "Digitalización de procesos",
    text: "Analizamos cómo funciona una operación, identificamos fricciones y encontramos oportunidades para mejorarla.",
  },
  {
    id: "a-medida",
    index: "S.04",
    Glyph: GlyphForm,
    title: "Soluciones a medida",
    text: "Cuando lo existente no resuelve el problema, diseñamos y construimos una solución adaptada al contexto.",
  },
];

/**
 * SECCIÓN 04 — QUÉ HACEMOS
 * Índice de archivo: cada fila es un área de trabajo. Al elegir una,
 * el formulario de contacto llega con el tipo de necesidad preseleccionado.
 */
export default function Services() {
  const ref = useInView<HTMLElement>(0.08);

  const choose = (id: string) => {
    window.dispatchEvent(new CustomEvent("iter:need", { detail: id }));
  };

  return (
    <section
      id="que-hacemos"
      ref={ref}
      className="rv-observe scroll-mt-16 bg-mist px-5 py-20 sm:px-8 lg:py-28"
      aria-labelledby="services-title"
    >
      <Reveal variant="up">
        <p className="mono-label text-smoke">
          <span className="text-red">02</span> / Qué hacemos
        </p>
      </Reveal>

      <Reveal variant="line" className="mt-6 max-w-6xl">
        <h2 id="services-title" className="display-section">
          No partimos de una tecnología. Partimos del problema.
        </h2>
      </Reveal>

      <Reveal variant="up" delay={140} className="mt-8 max-w-2xl">
        <p className="body-text">
          Cada problema necesita una solución diferente. Por eso no vendemos
          una única respuesta para todos los casos.
        </p>
      </Reveal>

      <div className="mt-14" role="list">
        {areas.map((a, i) => (
          <Reveal key={a.id} variant="up" delay={i * 100}>
            <a
              href="#contacto"
              onClick={() => choose(a.id)}
              role="listitem"
              data-cursor="Consultar"
              className="group relative block border-t border-ink/15 py-8 outline-none transition-colors focus-visible:bg-black lg:py-9"
              aria-label={`${a.title}. Consultar sobre esta área`}
            >
              <div
                className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-black transition-transform duration-500 ease-iter group-hover:scale-y-100"
                aria-hidden="true"
              />
              <div className="relative grid grid-cols-12 items-center gap-4 px-1 transition-colors duration-300 group-hover:text-white">
                <span className="mono-label col-span-2 text-smoke transition-colors duration-300 group-hover:text-white/50 sm:col-span-1">
                  {a.index}
                </span>
                <a.Glyph className="col-span-2 h-9 w-9 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:text-red sm:col-span-1 sm:h-10 sm:w-10" />
                <div className="col-span-8 sm:col-span-9 lg:col-span-8">
                  <h3 className="display-sub uppercase">{a.title}</h3>
                  <p className="body-text mt-2 max-w-2xl text-smoke transition-colors duration-300 group-hover:text-white/70">
                    {a.text}
                  </p>
                </div>
                <span
                  className="col-span-12 text-2xl transition-all duration-300 group-hover:translate-x-1 group-hover:text-red lg:col-span-2 lg:text-right"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>
            </a>
          </Reveal>
        ))}
        <div className="border-t border-ink/15" />
      </div>

      <Reveal variant="up" delay={100} className="mt-8">
        <p className="mono-data max-w-2xl text-smoke">
          Áreas de capacidad, no paquetes cerrados. Cada caso se evalúa antes
          de prometer un resultado.
        </p>
      </Reveal>
    </section>
  );
}
