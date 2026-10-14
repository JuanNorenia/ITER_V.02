import Cursor from "@/components/Cursor";
import HorseStrip from "@/components/HorseStrip";
import Marquee from "@/components/Marquee";
import PrivacyOverlay from "@/components/PrivacyOverlay";
import ScrollHud from "@/components/ScrollHud";
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import Friction from "@/sections/Friction";
import Services from "@/sections/Services";
import Method from "@/sections/Method";
import Principles from "@/sections/Principles";
import Audience from "@/sections/Audience";
import FinalCta from "@/sections/FinalCta";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <>
      <Cursor />
      <ScrollHud />
      <Header />
      <main>
        <Hero />
        <Marquee
          items={[
            "Cuestionar lo obvio",
            "La función da forma",
            "El arte de encontrar la forma",
          ]}
        />
        <Friction />
        <Services />
        <Method />
        <Principles />
        <Audience />
        <HorseStrip />
        <FinalCta />
        <Contact />
        <Marquee
          dark
          items={[
            "Tecnología con propósito",
            "Complejidad innecesaria, no",
            "Encontramos la forma",
          ]}
        />
      </main>
      <Footer />
      <PrivacyOverlay />
    </>
  );
}
