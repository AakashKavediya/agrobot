export default function AgroBotFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#0b0b0b] border-t border-white/10">
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-16">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-12 pb-14 border-b border-white/10">

          {/* BRAND */}
          <div>
            <h1 className="text-white text-3xl sm:text-4xl font-black tracking-[-0.05em]">
              AGROBOT
              <span className="text-[#f5a623]">.ai</span>
            </h1>

            <p className="mt-5 text-[#9a9a9a] text-sm leading-relaxed max-w-[420px]">
              AI-powered autonomous farming robots designed for precision agriculture,
              smart irrigation, crop monitoring, disease detection, and intelligent farm automation.
            </p>

            {/* SOCIALS */}
            <div className="flex gap-4 mt-7">

              {[
                "GitHub",
                "LinkedIn",
                "Instagram",
                "YouTube",
              ].map((item) => (
                <button
                  key={item}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[#d6d6d6] text-sm hover:border-[#f5a623] hover:text-white transition-all duration-300"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">
              Navigation
            </h3>

            <div className="flex flex-col gap-3 text-[#9a9a9a] text-sm">
              <a href="#" className="hover:text-white transition-colors duration-300">
                Home
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                About
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Features
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Simulation
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Dashboard
              </a>
            </div>
          </div>

          {/* TECHNOLOGIES */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">
              Technologies
            </h3>

            <div className="flex flex-col gap-3 text-[#9a9a9a] text-sm">
              <p>AI Crop Detection</p>
              <p>Autonomous Navigation</p>
              <p>Precision Irrigation</p>
              <p>IoT Monitoring</p>
              <p>GPS Tracking</p>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">
              Contact
            </h3>

            <div className="flex flex-col gap-4 text-sm">

              <div>
                <p className="text-[#7a7a7a] mb-1">
                  Email
                </p>
                <p className="text-[#d6d6d6]">
                  aakashkavediya@gmail.com
                </p>
              </div>

              <div>
                <p className="text-[#7a7a7a] mb-1">
                  Location
                </p>
                <p className="text-[#d6d6d6]">
                  Mumbai, India
                </p>
              </div>

              <div>
                <p className="text-[#7a7a7a] mb-1">
                  Platform
                </p>
                <p className="text-[#d6d6d6]">
                  Smart Agriculture Ecosystem
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-8">

          <p className="text-[#6d6d6d] text-xs sm:text-sm tracking-wide">
            © 2026 AGROBOT.ai — All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs sm:text-sm text-[#7a7a7a]">
            <a href="#" className="hover:text-white transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Documentation
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
