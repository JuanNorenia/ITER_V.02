import { Reveal } from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";

const profiles = [
  {
    n: "Q.01",
    text: "Empresas que quieren simplificar operaciones.",
  },
  {
    n: "Q.02",
    text: "Equipos que necesitan automatizar tareas.",
  },
  {
    n: "Q.03",
    text: "Personas con una idea de producto que quieren llevarla a la realidad.",
  },
  {
    n: "Q.04",
    text: "Negocios que necesitan conectar o mejorar sus herramientas digitales.",
  },
];

/**
 * SECCIÓN 07 — PARA QUIÉN
 * Retícula 2×2 de identificación: el visitante debe reconocerse.
 */
export default function Audience() {
  const ref = useInView<HTMLElement>(0.08);

  return (
    <section
      id="para-quien"
      ref={ref}
      className="rv-observe scroll-mt-16 px-5 py-20 sm:px-8 lg:py-28"
      aria-labelledby="audiencia-title"
    >
      <Reveal variant="up">
        <p className="mono-label text-smoke">
          <span className="text-red">05</span> / Para quién
        </p>
      </Reveal>

      <Reveal variant="line" className="mt-6 max-w-6xl">
        <h2 id="audiencia-title" className="display-section">
          Si algo debería funcionar mejor, hablemos.
        </h2>
      </Reveal>

      <Reveal variant="up" delay={140} className="mt-8 max-w-2xl">
        <p className="body-text">
          Trabajamos con personas y equipos que saben que existe una mejor
          forma de hacer las cosas, aunque todavía no tengan claro cómo
          construirla.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-px bg-ink/15 sm:grid-cols-2">
        {profiles.map((p, i) => (
          <Reveal key={p.n} variant="up" delay={i * 90}>
            <a
              href="#contacto"
              data-cursor="Ese soy yo"
              className="group flex h-full min-h-[180px] flex-col justify-between bg-paper p-6 outline-none transition-colors duration-300 hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white lg:min-h-[220px] lg:p-8"
            >
              <span className="mono-label text-smoke transition-colors duration-300 group-hover:text-white/50">
                {p.n}
              </span>
              <div className="mt-10 flex items-end justify-between gap-4">
                <p className="display-sub max-w-md">{p.text}</p>
                <span
                  className="text-2xl opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-red group-hover:opacity-100"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
