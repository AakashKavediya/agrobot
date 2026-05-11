"use client";

import { useEffect, useState } from "react";

// COMPONENTS
import IoTDashboard from "@/components/baseDashboard";
import AgroBotArchitecture from "@/components/architecture";
import HeroLandingPage from "@/components/heropage";
import PremiumIOSLoader from "@/components/loading";
import SmartFarmSimulation from "@/components/simulation";
import ContactForm from "@/components/ContactForm";
import AgroBotFooter from "@/components/footer";
export default function Home() {

  const [loading, setLoading] = useState(true);

  // 10 SECOND LOADER
  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);

  }, []);

  return (
    <div className="relative w-screen max-w-[100vw] overflow-x-hidden bg-black">
      {loading && (
        <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-black">
          <PremiumIOSLoader />
        </div>
      )}

      <main
        className={`w-screen max-w-[100vw] overflow-x-hidden bg-black ${
          loading ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'
        }`}
      >
        {/* HERO */}
        <section className="w-screen max-w-[100vw] overflow-hidden">
          <HeroLandingPage />
        </section>

        {/* DASHBOARD */}
        <section className="w-screen max-w-[100vw] overflow-hidden">
          <IoTDashboard />
        </section>

        {/* ARCHITECTURE */}
        <section className="w-screen max-w-[100vw] overflow-hidden">
          <AgroBotArchitecture />
        </section>
        
        {/* SIMULATION */}
        <section className="w-screen max-w-[100vw] overflow-hidden">
          <SmartFarmSimulation />
        </section>
        {/* CONTACT */}
        <section className="w-screen max-w-[100vw] overflow-hidden">
          <ContactForm />
        </section>
        {/* FOOTER */}
        <section className="w-screen max-w-[100vw] overflow-hidden">
          <AgroBotFooter />
        </section>
      </main>
    </div>
  );
}