"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Droplets,
  CloudRain,
  WifiOff,
  Bug,
  TrendingDown,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const problems = [
  { icon: Clock,        title: "Late Detection",       line: "Damage spreads before anyone spots it.",        metric: "72 h",  metricLabel: "avg. delay" },
  { icon: Droplets,     title: "Irrigation Guesswork", line: "Water applied blind — waste up, yield down.",   metric: "30 %",  metricLabel: "water lost" },
  { icon: CloudRain,    title: "Climate Risks",        line: "No field-level warning for extreme weather.",   metric: "0 hrs", metricLabel: "warning" },
  { icon: WifiOff,      title: "No Connectivity",      line: "Rural dead zones cut farmers off from experts.", metric: "40 %", metricLabel: "coverage gap" },
  { icon: Bug,          title: "Blanket Spraying",     line: "Whole fields doused to treat a fraction.",      metric: "100 %", metricLabel: "field treated" },
  { icon: TrendingDown, title: "Lost Income",          line: "Small farmers absorb every loss alone.",        metric: "25 %",  metricLabel: "income swing" },
];

const EASE = [0.22, 1, 0.36, 1];

/* ─────────────────────────────────────────────────────────────
   MATTE TOKENS  (local — moves to globals.css next pass)
───────────────────────────────────────────────────────────── */
const S = {
  bg:       "#08090B",
  card:     "#0C0D10",
  active:   "#0F1013",
  hairline: "#1C1D21",
  border:   "rgba(255,255,255,0.06)",
  borderAm: "rgba(245,166,35,0.35)",
  text:     "#F5F5F7",
  textDim:  "#A1A1A6",
  textMute: "#6E6E73",
  textFaint:"#48484A",
  accent:   "#F5A623",
};

export default function ProblemStatement() {
  const videoRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <section
      id="problem-statement"
      className="relative w-full bg-[#08090B] py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">

        {/* ═══════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════ */}
        <motion.header
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="relative grid grid-cols-1 gap-8 border-b border-white/[0.06] pb-12 md:grid-cols-[1.5fr_1fr] md:items-end md:gap-16"
        >
          {/* § marker */}
          <motion.span
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
            }}
            className="absolute right-0 top-0 hidden font-mono text-[10px] uppercase tracking-[0.28em] text-[#48484A] md:block"
          >
            § 01
          </motion.span>

          <div>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
              }}
              className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[#F5A623]"
            >
              The Problem
            </motion.p>

            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
              }}
              className="text-[32px] font-semibold leading-[1.05] tracking-[-0.038em] text-[#F5F5F7] md:text-[52px]"
            >
              Six threats Indian farmers
              <br className="hidden md:block" />{" "}
              <span className="text-[#6E6E73]">face every season.</span>
            </motion.h2>
          </div>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, delay: 0.08 } },
            }}
            className="max-w-md text-[13.5px] leading-[1.65] text-[#A1A1A6] md:pb-1.5 md:text-[14px]"
          >
            Climate volatility is rising while diagnosis, advisory, and
            infrastructure stay out of reach — compounding into a single,
            unmanageable burden.
          </motion.p>
        </motion.header>

        {/* ═══════════════════════════════════════════════════════
            MAIN
        ═══════════════════════════════════════════════════════ */}
        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">

          {/* ───── LEFT · TIMELINE ───── */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
            }}
            className="relative"
          >
            <ul className="relative">
              {/* continuous hairline through all nodes */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-[13px] top-[30px] bottom-[30px] w-px"
                style={{ backgroundColor: S.hairline }}
              />

              {/* active segment of hairline, amber, animated */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-[13px] w-px"
                style={{ backgroundColor: S.accent, opacity: 0.55 }}
                initial={false}
                animate={{
                  top: 30 + activeIdx * 74 + 30,
                  height: 74 - 60,
                }}
                transition={{ duration: 0.4, ease: EASE }}
              />

              {problems.map((p, i) => {
                const Icon = p.icon;
                const isActive = i === activeIdx;
                return (
                  <motion.li
                    key={p.title}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                    }}
                    className="relative flex items-start gap-5"
                  >
                    {/* NODE */}
                    <span
                      className="relative z-10 mt-[18px] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border font-mono text-[9px] tracking-wider transition-colors duration-200"
                      style={{
                        backgroundColor: isActive ? S.accent : S.bg,
                        borderColor: isActive ? S.accent : S.hairline,
                        color: isActive ? "#0A0B0D" : S.textMute,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* ROW */}
                    <button
                      onMouseEnter={() => setActiveIdx(i)}
                      onFocus={() => setActiveIdx(i)}
                      onClick={() => setActiveIdx(i)}
                      className="group relative flex min-w-0 flex-1 flex-col items-start rounded-xl px-4 py-4 text-left transition-colors duration-200"
                      style={{
                        backgroundColor: isActive ? S.active : "transparent",
                      }}
                    >
                      {/* title row */}
                      <span className="flex w-full items-baseline justify-between gap-4">
                        <span
                          className="flex items-center gap-2.5 text-[15px] font-medium leading-none tracking-[-0.01em] transition-colors duration-200"
                          style={{ color: isActive ? S.text : S.textDim }}
                        >
                          <Icon
                            className="h-[14px] w-[14px] shrink-0 transition-colors duration-200"
                            style={{ color: isActive ? S.accent : S.textFaint }}
                          />
                          {p.title}
                        </span>

                        <span
                          className="hidden shrink-0 font-mono text-[11px] tracking-wider transition-all duration-200 md:block"
                          style={{
                            color: isActive ? S.accent : "transparent",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {p.metric}
                        </span>
                      </span>

                      {/* one-liner */}
                      <span
                        className="mt-1.5 text-[12.5px] leading-[1.5] transition-colors duration-200"
                        style={{ color: isActive ? S.textDim : S.textMute }}
                      >
                        {p.line}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          {/* ───── RIGHT · VIDEO ───── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="relative lg:pl-2"
          >
            <div
              className="relative overflow-hidden rounded-2xl border"
              style={{
                backgroundColor: "#000",
                borderColor: S.border,
                boxShadow: "0 24px 60px -30px rgba(0,0,0,0.9)",
              }}
            >
              <video
                ref={videoRef}
                className="aspect-[4/5] w-full object-cover lg:aspect-auto lg:h-[520px]"
                src="/videos/garib_kisaan1.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />

              {/* soft bottom gradient for caption legibility — pure black */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* top-left dot · live */}
              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/60"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  Rec · {String(activeIdx + 1).padStart(2, "0")} / 06
                </span>
              </div>

              {/* bottom caption */}
              <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#F5A623]">
                    Field footage
                  </p>
                  <p className="mt-1 truncate text-[12.5px] text-white/70">
                    Smallholder farms · Rural India
                  </p>
                </div>
                <span
                  className="shrink-0 font-mono text-[10px] text-white/35"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  1080p
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            BOTTOM · ANCHORS
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-20 grid grid-cols-1 gap-px border-t border-white/[0.06] pt-6 sm:grid-cols-3 sm:gap-0"
        >
          <Anchor k="Source"   v="ICAR–KVK, Kosbad Hill" />
          <Anchor k="Duration" v="6-month field study"     />
          <Anchor k="Region"   v="Dahanu · Maharashtra"    />
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Anchor — a labeled reference, not a stat card
───────────────────────────────────────────────────────────── */
function Anchor({ k, v }) {
  return (
    <div className="flex items-baseline gap-3 sm:px-6 sm:first:pl-0 sm:last:pr-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#48484A]">
        {k}
      </span>
      <span className="text-[13px] text-[#A1A1A6]">{v}</span>
    </div>
  );
}