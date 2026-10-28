import { Link } from "react-router";
import { useLocale } from "@/providers/LocaleProvider";

export default function NotFoundPage() {
  const { t } = useLocale();

  return (
    <section
      className="relative isolate flex min-h-[calc(100svh-64px)] flex-col justify-between overflow-hidden bg-paper px-5 py-10 sm:px-8 sm:py-14"
      aria-labelledby="not-found-title"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 grid grid-cols-4 opacity-60 sm:grid-cols-8"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} className="border-l border-line" />
        ))}
      </div>

      <div className="mono-label flex items-center justify-between border-b border-line pb-3 text-smoke">
        <span>{t("ITER / Ruta no encontrada")}</span>
        <span className="bg-red px-2 py-1 text-white">404</span>
      </div>

      <div className="relative z-10 grid flex-1 items-center gap-10 py-16 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <p className="mono-label mb-5 text-red">
            {t("Fuera de la retícula")}
          </p>
          <h1
            id="not-found-title"
            className="display-hero max-w-5xl text-[clamp(4rem,15vw,12rem)]"
          >
            {t("Esta forma no existe.")}
          </h1>
          <p className="body-text mt-8 max-w-xl text-smoke">
            {t(
              "La dirección que buscas cambió o ya no está disponible. Volvamos a encontrar el camino."
            )}
          </p>
          <Link
            to="/"
            className="btn-sweep btn-sweep--red red-edge-link mono-label mt-8 inline-flex min-h-12 items-center gap-4 border border-red bg-red px-6 py-3 text-white"
          >
            <span aria-hidden="true">←</span>
            {t("Volver al inicio")}
          </Link>
        </div>

        <div
          className="mono-data hidden justify-self-end text-right text-smoke lg:block"
          aria-hidden="true"
        >
          <p>ITER / 404</p>
          <p className="mt-2">
            {t("Estructura → intervención → transformación")}
          </p>
        </div>
      </div>

      <div className="mono-data flex justify-between border-t border-line pt-3 text-smoke">
        <span>ITER</span>
        <span>{t("Encontramos la forma.")}</span>
      </div>
    </section>
  );
}
