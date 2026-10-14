
import HorseStrip from "@/components/HorseStrip";
import Marquee from "@/components/Marquee";

import Hero from "@/sections/Hero";
import Friction from "@/sections/Friction";
import Services from "@/sections/Services";
import Method from "@/sections/Method";
import Principles from "@/sections/Principles";
import Audience from "@/sections/Audience";
import FinalCta from "@/sections/FinalCta";


export default function Home() {
  return (
    <>

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

        <Marquee
          dark
          items={[
            "Tecnología con propósito",
            "Complejidad innecesaria, no",
            "Encontramos la forma",
          ]}
        />

    </>
  );
}
