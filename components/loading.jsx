'use client'
export default function PremiumIOSLoader() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />

      {/* Floating Ambient Blur */}
      <div className="absolute top-[-120px] left-[-80px] w-[300px] h-[300px] bg-white/5 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-[-80px] w-[300px] h-[300px] bg-white/5 blur-3xl rounded-full" />

      {/* Main Loader Container */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* Metallic Orb */}
        <div className="relative w-32 h-32 flex items-center justify-center">

          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-white/10 backdrop-blur-xl bg-white/[0.02] shadow-[0_0_60px_rgba(255,255,255,0.08)]" />

          {/* Animated Spinner */}
          <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-[#d9d9d9] border-r-[#8f8f8f] animate-spin" />

          {/* Inner Metallic Core */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d7d7d7] via-[#9a9a9a] to-[#5a5a5a] shadow-[inset_0_2px_8px_rgba(255,255,255,0.35),0_0_30px_rgba(255,255,255,0.12)]" />
        </div>

        {/* Branding */}
        <div className="text-center">
          <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight">
            AGROBOT
            <span className="text-[#bdbdbd]">.ai</span>
          </h1>

          <p className="mt-3 text-[#8f8f8f] text-sm sm:text-base font-medium tracking-wide">
            Initializing Autonomous Farming Systems
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-[260px] h-[5px] rounded-full bg-white/10 overflow-hidden backdrop-blur-md border border-white/5">
          <div className="h-full w-full origin-left animate-[loading_10s_linear_forwards] bg-gradient-to-r from-[#5f5f5f] via-[#d6d6d6] to-[#ffffff]" />
        </div>

        {/* Percentage */}
        <div className="text-[#b5b5b5] text-sm tracking-[0.25em] animate-pulse">
          LOADING...
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
