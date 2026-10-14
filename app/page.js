"use client";

import { useEffect, useState } from "react";

import IoTDashboard from "@/components/baseDashboard";
import AgroBotArchitecture from "@/components/architecture";
import HeroLandingPage from "@/components/heropage";
import PremiumIOSLoader from "@/components/loading";
import SmartFarmSimulation from "@/components/simulation";
import ContactForm from "@/components/ContactForm";
import AgroBotFooter from "@/components/footer";
import VideoGallery from "@/components/video";
import BotImageGallery from "@/components/images";
import FieldVisit from "@/components/fieldvisit";
import ProblemStatement from "@/components/ProblemStatement";
import BotPricing from "@/components/BotPricing";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full bg-black overflow-x-clip">
      {loading && (
        <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-black">
          <PremiumIOSLoader />
        </div>
      )}

      <main
        className={`w-full bg-black transition-opacity duration-500 ${
          loading ? "opacity-0 pointer-events-none select-none" : "opacity-100"
        }`}
      >
        <section className="w-full overflow-x-clip">
          <HeroLandingPage />
        </section>

        {/* ⚠️ NO overflow-hidden wrapper here — sticky inside needs to escape */}
        <ProblemStatement />

        <section className="w-full overflow-x-clip">
          <FieldVisit />
        </section>

        <section className="w-full overflow-x-clip">
          <IoTDashboard />
        </section>

        <section className="w-full overflow-x-clip">
          <AgroBotArchitecture />
        </section>

        <section className="w-full overflow-x-clip">
          <VideoGallery />
        </section>

        <section className="w-full overflow-x-clip">
          <BotImageGallery />
        </section>

          {/* <section className="w-full overflow-x-clip">
            <SmartFarmSimulation />
          </section> */}

        <section className="w-full overflow-x-clip">
          <BotPricing />
        </section>

        <section className="w-full overflow-x-clip">
          <ContactForm />
        </section>

        <section className="w-full overflow-x-clip">
          <AgroBotFooter />
        </section>
      </main>
    </div>
  );
}