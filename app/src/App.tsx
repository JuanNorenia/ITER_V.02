import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import SiteLayout from "./components/SiteLayout";
import { useLocale } from "./providers/LocaleProvider";

const ContactPage = lazy(() => import("./pages/ContactPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageLoading() {
  const { t } = useLocale();
  return (
    <div className="mono-label px-5 py-12 text-smoke" role="status">
      ITER / {t("Cargando")}
    </div>
  );
}

function loadPage(page: ReactNode) {
  return <Suspense fallback={<PageLoading />}>{page}</Suspense>;
}

export default function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/u, "");
  const pathname = window.location.pathname.replace(/\/$/u, "") || "/";
  const routePath =
    basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const isDirectContact = routePath === "/contacto";
  const isUnknownDirectPath =
    routePath !== "/" && !isDirectContact && routePath !== "/index.html";

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route
          path="/"
          element={
            isUnknownDirectPath ? (
              loadPage(<NotFoundPage />)
            ) : isDirectContact ? (
              loadPage(<ContactPage />)
            ) : (
              <Home />
            )
          }
        />
        <Route path="/contacto" element={loadPage(<ContactPage />)} />
        <Route path="*" element={loadPage(<NotFoundPage />)} />
      </Route>
    </Routes>
  );
}
