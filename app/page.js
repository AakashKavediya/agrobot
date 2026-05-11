import Image from "next/image";


// importing components
import IoTDashboard from "@/components/baseDashboard";
import AgroBotArchitecture from "@/components/architecture";
import HeroLandingPage from "@/components/heropage";

export default function Home() {
  return (
    <div className="">
      <div>
        <HeroLandingPage />
      </div>
      <div>
        <IoTDashboard />
      </div>
      <div>
        <AgroBotArchitecture />
      </div>

    </div>
  );
}
