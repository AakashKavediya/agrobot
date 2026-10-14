"use client";

import { useRef, useState, Suspense, Component } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  Html,
} from "@react-three/drei";
import {
  Check,
  X,
  Cpu,
  Camera,
  Navigation,
  Radio,
  Sparkles,
  Award,
  Loader2,
} from "lucide-react";

/* ─────────────────────────────────────────────
   PLAN DATA
   • modelPath  → your .glb in /public/models/
   • transform  → per-model scale/position/rotation
   • featured   → highlights the right card
───────────────────────────────────────────── */
const plans = [
  {
    id: "origin",
    name: "SLAM BOT · ORIGIN",
    price: 9000,
    currency: "INR",
    tagline: "Unlock the full experience",
    modelPath: "/models/AgroBot_lidar1.glb",
    /* 🎛️ TWEAK THESE FOR ORIGIN */
    transform: {
      scale: 0.1,          // ← adjust per model
      position: [0, -0.6, 0],
      rotation: [0, 0, 0],
    },
    featured: false,
    ctaLabel: "Get ORIGIN",
    features: [
      { text: "ESP32 Cam Navigation",               included: true,  icon: Cpu },
      { text: "AI crop detection via mobile app",   included: true,  icon: Sparkles },
      { text: "Precision spraying (40–50% savings)",included: true,  icon: Navigation },
      { text: "n8n → Telegram updates",             included: true,  icon: Radio },
      { text: "No onboard camera → cost saved",     included: true,  icon: Camera },
      { text: "Semi-autonomous navigation",         included: true,  icon: Navigation },
      { text: "Application-based crop detection",   included: true,  icon: Sparkles },
      { text: "LiDAR-based SLAM",                   included: false },
      { text: "Fully autonomous navigation",        included: false },
    ],
  },
  {
    id: "apex",
    name: "SLAM BOT · APEX",
    price: 18000,
    currency: "INR",
    tagline: "Maximize your productivity",
    modelPath: "/models/AgroBotV2.glb",
    /* 🎛️ TWEAK THESE FOR APEX */
    transform: {
      scale: 0.6,        // ← APEX is bigger by default
      position: [0, -0.2, 0],
      rotation: [0, 0, 0],
    },
    featured: true,
    ctaLabel: "Get APEX",
    features: [
      { text: "LiDAR-based SLAM (high precision)",  included: true, icon: Cpu },
      { text: "SLAM navigation + mapping",          included: true, icon: Navigation },
      { text: "Precision spraying (40–50% savings)",included: true, icon: Navigation },
      { text: "n8n → Telegram updates + call support", included: true, icon: Radio },
      { text: "Onboard camera + AI crop detection", included: true, icon: Camera },
      { text: "Fully autonomous navigation",        included: true, icon: Navigation },
      { text: "High-precision spraying (50–60% savings)", included: true, icon: Sparkles },
      { text: "ESP32 Cam fallback",                 included: true, icon: Cpu },
      { text: "Semi-autonomous mode",               included: true, icon: Navigation },
    ],
  },
];

export default function BotPricing() {
  const [activePlan, setActivePlan] = useState("apex");
  const [loading, setLoading] = useState(true);

  const preview = plans.find((p) => p.id === activePlan);

  return (
    <section
      id="bot-pricing"
      className="relative w-full overflow-hidden bg-[#080808] py-20 md:py-28"
    >
      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-orange-500/10 blur-[150px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-1/4 h-[520px] w-[520px] rounded-full bg-red-500/10 blur-[150px]" />

      {/* grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 78%)",
        }}
      />

      {/* TOP HUD */}
      <div className="relative z-20 mx-auto mb-14 flex max-w-[1500px] items-center justify-between px-6 md:px-12 lg:px-16">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-400">
            Acquire · SLAM Bot Series
          </span>
        </div>
        <div className="hidden font-mono text-[10px] uppercase tracking-widest text-neutral-500 md:block">
          Two Configurations · One Platform
        </div>
      </div>

      {/* HEADER */}
      <div className="relative z-10 mx-auto mb-14 max-w-[1500px] px-6 md:px-12 lg:px-16">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          Chapter 06 · Deployment
        </p>
        <h2 className="max-w-3xl text-3xl font-bold leading-[1.08] tracking-tight text-white md:text-[44px] lg:text-[54px]">
          Choose your{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            SLAM Bot
          </span>{" "}
          configuration
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">
          Two builds, one platform. Start with ORIGIN for field-ready autonomy,
          or go APEX for full LiDAR SLAM and onboard AI.
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="relative z-10 mx-auto grid max-w-[1500px] grid-cols-1 gap-10 px-6 md:px-12 lg:grid-cols-[1fr_1.6fr] lg:gap-14 lg:px-16">
        {/* ─────────── LEFT: 3D VIEWER ─────────── */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-4 rounded-[36px] bg-gradient-to-br from-orange-500/15 via-orange-400/5 to-transparent blur-2xl" />

          <div className="relative overflow-hidden rounded-[28px] border border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-black">
            <span className="pointer-events-none absolute left-3 top-3 z-20 h-5 w-5 border-l-2 border-t-2 border-orange-400/80" />
            <span className="pointer-events-none absolute right-3 top-3 z-20 h-5 w-5 border-r-2 border-t-2 border-orange-400/80" />
            <span className="pointer-events-none absolute bottom-3 left-3 z-20 h-5 w-5 border-b-2 border-l-2 border-orange-400/80" />
            <span className="pointer-events-none absolute bottom-3 right-3 z-20 h-5 w-5 border-b-2 border-r-2 border-orange-400/80" />

            {/* top-left label */}
            <div className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-full border border-orange-400/40 bg-black/60 px-3 py-1 backdrop-blur-md">
              <Cpu className="h-3 w-3 text-orange-400" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={preview.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px] font-semibold uppercase tracking-widest text-white/90"
                >
                  {preview.name}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* top-right 3D badge */}
            <div className="absolute right-6 top-6 z-20 flex items-center gap-2 rounded-full border border-neutral-700 bg-black/60 px-3 py-1 backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-300">
                3D · GLB
              </span>
            </div>

            {/* CANVAS */}
            <div className="relative aspect-square w-full">
              <Canvas
                camera={{ position: [3, 2, 4], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                onCreated={() => setLoading(false)}
              >
                <ambientLight intensity={0.45} />
                <spotLight
                  position={[5, 8, 5]}
                  angle={0.4}
                  intensity={1.2}
                  castShadow
                />
                <directionalLight
                  position={[-5, 3, -3]}
                  intensity={0.4}
                  color="#ff9955"
                />

                {/* ⚠️ key+remount → guarantees fresh model on switch */}
                <ModelErrorBoundary key={preview.id}>
                  <Suspense fallback={null}>
                    <ModelWithTransform
                      modelPath={preview.modelPath}
                      transform={preview.transform}
                    />
                  </Suspense>
                </ModelErrorBoundary>

                <Environment preset="warehouse" />
                <ContactShadows
                  position={[0, -1.4, 0]}
                  opacity={0.5}
                  scale={10}
                  blur={2.4}
                  far={4}
                  color="#000000"
                />

                <OrbitControls
                  enablePan={false}
                  enableZoom
                  minDistance={2.5}
                  maxDistance={8}
                  autoRotate
                  autoRotateSpeed={1.2}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 1.8}
                />
              </Canvas>

              {loading && <LoaderOverlay />}
            </div>

            {/* bottom hints */}
            <div className="absolute bottom-5 left-6 z-20 flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-white/60">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
              Drag to rotate · Scroll to zoom
            </div>

            <div className="pointer-events-none absolute bottom-5 right-6 z-20 font-mono text-[10px] text-neutral-500">
              {preview.featured ? "APEX · v2" : "ORIGIN · v1"}
            </div>
          </div>

          {/* toggle between models */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlan(p.id)}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${
                  activePlan === p.id
                    ? "border-orange-400/50 bg-orange-400/10"
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  View
                </p>
                <p
                  className={`mt-0.5 text-sm font-semibold ${
                    activePlan === p.id ? "text-orange-400" : "text-neutral-300"
                  }`}
                >
                  {p.id === "origin" ? "ORIGIN" : "APEX"}
                </p>
              </button>
            ))}
          </div>

          {/* spec strip */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <MiniStat label="Build" value={preview.featured ? "APEX" : "ORIGIN"} />
            <MiniStat
              label="Nav"
              value={preview.featured ? "LiDAR SLAM" : "ESP32 Cam"}
            />
            <MiniStat
              label="Scale"
              value={preview.transform.scale.toFixed(2) + "×"}
            />
          </div>
        </div>

        {/* ─────────── RIGHT: PRICING CARDS ─────────── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {plans.map((plan, idx) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onHover={() => setActivePlan(plan.id)}
              isActive={activePlan === plan.id}
              delay={idx * 0.1}
            />
          ))}
        </div>
      </div>

      {/* bottom note */}
      <div className="relative z-10 mx-auto mt-14 flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-6 text-[10px] uppercase tracking-widest text-neutral-600 md:px-12 lg:px-16">
        <span>Prices in INR · Excludes shipping & GST</span>
        <span className="hidden md:inline">Bulk & dealer pricing available</span>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Model with per-plan scale/position/rotation
───────────────────────────────────────────── */
function ModelWithTransform({ modelPath, transform }) {
  const gltf = useGLTF(modelPath, true, true);
  const { scale = 1, position = [0, -1, 0], rotation = [0, 0, 0] } = transform || {};

  return (
    <primitive
      object={gltf.scene}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

/* ─────────────────────────────────────────────
   Error boundary — shows fallback if GLB missing
───────────────────────────────────────────── */
class ModelErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn("[BotPricing] 3D model failed to load:", err?.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="w-56 rounded-xl border border-orange-400/30 bg-black/85 px-4 py-3 text-center backdrop-blur">
            <p className="font-mono text-[10px] uppercase tracking-widest text-orange-400">
              3D Model Not Found
            </p>
            <p className="mt-1 text-[11px] leading-snug text-neutral-400">
              Add your .glb to
              <br />
              <span className="text-neutral-300">/public/models/</span>
            </p>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────
   Loader
───────────────────────────────────────────── */
function LoaderOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
        Loading 3D model…
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Mini stat
───────────────────────────────────────────── */
function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2.5">
      <p className="text-[9px] font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-xs font-semibold text-orange-400">
        {value}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Plan card
───────────────────────────────────────────── */
function PlanCard({ plan, onHover, isActive, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onHover}
      className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-b from-neutral-900/70 to-neutral-950/80 p-7 transition-all duration-500 ${
        plan.featured
          ? "border-orange-400/40 shadow-[0_0_60px_-20px_rgba(251,146,60,0.5)]"
          : "border-neutral-800"
      } ${isActive ? "ring-1 ring-orange-400/30" : ""}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-px ${
          plan.featured
            ? "bg-gradient-to-r from-transparent via-orange-400 to-transparent"
            : "bg-gradient-to-r from-transparent via-neutral-700 to-transparent"
        }`}
      />

      {plan.featured && (
        <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-orange-400/40 bg-orange-400/10 px-2.5 py-1">
          <Award className="h-3 w-3 text-orange-400" />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-orange-400">
            Recommended
          </span>
        </div>
      )}

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
          {plan.id === "origin" ? "Entry" : "Flagship"}
        </p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-white md:text-2xl">
          {plan.name}
        </h3>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          {plan.price.toLocaleString("en-IN")}
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          / {plan.currency}
        </span>
      </div>

      <p className="mt-2 text-sm text-neutral-400">{plan.tagline}</p>

      <button
        className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
          plan.featured
            ? "bg-gradient-to-r from-orange-400 to-amber-400 text-black hover:from-orange-300 hover:to-amber-300"
            : "border border-neutral-700 bg-neutral-900/60 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-900"
        }`}
      >
        {plan.ctaLabel}
      </button>

      <div className="mt-6 h-px w-full bg-neutral-800" />

      <ul className="mt-5 space-y-3">
        {plan.features.map((f, i) => {
          const Icon = f.icon;
          const included = f.included;
          return (
            <motion.li
              key={f.text}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: delay + 0.15 + i * 0.03 }}
              className="flex items-start gap-3"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  included
                    ? "bg-orange-400 text-black"
                    : "border border-neutral-700 bg-neutral-900 text-neutral-600"
                }`}
              >
                {included ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <X className="h-3 w-3" strokeWidth={3} />
                )}
              </span>

              <span
                className={`text-[13px] leading-relaxed md:text-sm ${
                  included ? "text-neutral-200" : "text-neutral-600 line-through"
                }`}
              >
                {f.text}
              </span>

              {included && Icon && (
                <Icon className="ml-auto mt-0.5 hidden h-3.5 w-3.5 shrink-0 text-neutral-600 md:block" />
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}