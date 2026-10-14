"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Users, Sprout, Lightbulb, X, ChevronLeft, ChevronRight } from "lucide-react";

// ✏️ EDIT THIS: replace with your 4 images in /public/field-visit/
const fieldImages = [
  { src: "/images/field_visit/field_visit1.jpeg", alt: "KVK Kosbad Hill entrance and research facility" },
  { src: "/images/field_visit/field_visit2.jpeg", alt: "Crop variety demonstration plots" },
  { src: "/images/field_visit/field_visit3.jpeg", alt: "Interaction with agricultural scientists" },
  { src: "/images/field_visit/field_visit4.png", alt: "Nursery and cultivation practices" },
];

const highlights = [
  { icon: Sprout, label: "Crop varieties & nurseries" },
  { icon: MapPin, label: "Field conditions & cultivation" },
  { icon: Users, label: "Scientists & field experts" },
  { icon: Lightbulb, label: "Real farmer challenges" },
];

export default function FieldVisit() {
  const [active, setActive] = useState(null); // index of lightbox image, or null

  const open = (i) => setActive(i);
  const close = () => setActive(null);
  const prev = () => setActive((i) => (i === 0 ? fieldImages.length - 1 : i - 1));
  const next = () => setActive((i) => (i === fieldImages.length - 1 ? 0 : i + 1));

  return (
    <section className="relative bg-[#0a0a0a] py-24 px-6 md:px-12 lg:px-20">
      {/* Subtle top divider to blend with neighboring sections */}
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
            Field Visit &amp; Expert Interaction
          </p>
          <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
            Understanding Real-World{" "}
            <span className="text-orange-400">Farming Challenges</span> Through
            Direct Field Exposure
          </h2>
          <p className="mt-6 text-base leading-relaxed text-neutral-400 md:text-lg">
            Our field visit to the{" "}
            <span className="font-medium text-neutral-200">
              ICAR–Krishi Vigyan Kendra, Kosbad Hill, Dahanu, Maharashtra
            </span>{" "}
            provided valuable practical insights into modern agriculture. We
            explored crop varieties, nurseries, field conditions, cultivation
            practices, and agricultural research facilities, while interacting
            directly with scientists, agricultural experts, and field
            professionals. These discussions helped us understand the real
            challenges faced by farmers and identify opportunities where
            AgroSLAM's autonomous navigation, SLAM-based field mapping, crop
            monitoring, and Edge AI can provide practical, data-driven support.
          </p>
        </div>

        {/* Highlight chips */}
        <div className="mt-8 flex flex-wrap gap-3">
          {highlights.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-xs font-medium text-neutral-300 md:text-sm"
            >
              <Icon className="h-4 w-4 text-orange-400" />
              {label}
            </span>
          ))}
        </div>

        {/* Image grid — 4 images */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {fieldImages.map((img, i) => (
            <button
              key={img.src}
              onClick={() => open(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label={`Open image: ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* dark gradient overlay for legibility */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-left text-xs font-medium leading-snug text-white/90">
                {img.alt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            className="absolute right-6 top-6 rounded-full bg-neutral-800/80 p-2 text-white hover:bg-neutral-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 rounded-full bg-neutral-800/80 p-2 text-white hover:bg-neutral-700 md:left-8"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800">
              <Image
                src={fieldImages[active].src}
                alt={fieldImages[active].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <p className="mt-4 text-center text-sm text-neutral-300">
              {fieldImages[active].alt}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 rounded-full bg-neutral-800/80 p-2 text-white hover:bg-neutral-700 md:right-8"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </section>
  );
}