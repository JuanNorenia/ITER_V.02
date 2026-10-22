import { Link, useSearchParams } from "react-router";
import Contact from "@/sections/Contact";
import ContactAsciiBackground from "@/components/ContactAsciiBackground";
import { useLocale } from "@/providers/LocaleProvider";

export default function ContactPage() {
  const [search] = useSearchParams();
  const { t } = useLocale();
  return (
    <div className="contact-page relative isolate min-h-svh pt-16">
      <ContactAsciiBackground />
      <div className="px-5 pt-6 sm:px-8">
        <Link to="/" className="link-line mono-label inline-flex min-h-11 items-center gap-3 bg-paper">
          <span aria-hidden="true">←</span> {t("Volver al inicio")}
        </Link>
      </div>
      <Contact key={search.get("need") ?? ""} initialNeed={search.get("need") ?? ""} />
    </div>
  );
}
