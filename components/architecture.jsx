"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "SLAM Navigation Core",
    description:
      "Demonstrates real-time farm mapping and autonomous path planning using advanced LiDAR and sensor fusion.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="8" y="8" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="4" y1="9" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="4" y1="15" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <line x1="16" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="16" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "AI Crop Analysis",
    description:
      "Leverages onboard cameras and AI models to detect crop health, growth stages, and diseases instantly.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="7" cy="9" r="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    title: "Precision Irrigation System",
    description:
      "Controls multi-zone irrigation nozzles using soil moisture, crop type, and weather inputs for water efficiency.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 2C8.5 2 6 4.5 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.5-2.5-6-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    title: "Remote Control & Monitoring",
    description:
      "Access the bot's live data, operational maps, and telemetry via a secure web dashboard or mobile app.",
  },
];

function RobotModelViewer() {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = null;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      40,
      width / height,
      0.1,
      100
    );

    camera.position.set(0, 1, 5.4);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(-5, 3, -3);
    scene.add(rimLight);

    // DRACO
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );

    // GLTF
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let model = null;
    let animationFrameId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (model) {
        // SLOWER ROTATION
        model.rotation.y += 0.0022;
      }

      renderer.render(scene, camera);
    };

    loader.load(
      "/models/AgroBotModel-v1.glb",

      (gltf) => {
        model = gltf.scene;

        // AUTO FIT MODEL
        const box = new THREE.Box3().setFromObject(model);

        const center = box.getCenter(new THREE.Vector3());

        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(
          size.x,
          size.y,
          size.z
        );

        // SLIGHTLY SMALLER SCALE FOR BETTER FIT
        const scale = 3.45 / maxDim;

        model.scale.setScalar(scale);

        // PERFECT POSITIONING
        model.position.x = -center.x * scale + 0.55;

        // MOVE MODEL SLIGHTLY UP
        model.position.y = -center.y * scale + 1;

        model.position.z = -center.z * scale;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        setIsLoading(false);

        animate();
      },

      undefined,

      (err) => {
        console.error("GLB load error:", err);

        setError("Failed to load model.");

        setIsLoading(false);

        animate();
      }
    );

    // RESPONSIVE
    const handleResize = () => {
      if (!container) return;

      const w = container.clientWidth;
      const h = container.clientHeight || 1;

      camera.aspect = w / h;

      camera.updateProjectionMatrix();

      renderer.setSize(w, h);

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
      );
    };

    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(handleResize);

    ro.observe(container);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener(
        "resize",
        handleResize
      );

      ro.disconnect();

      dracoLoader.dispose();

      if (model) {
        scene.remove(model);

        model.traverse((child) => {
          if (!child.isMesh) return;

          child.geometry?.dispose();

          const mat = child.material;

          if (Array.isArray(mat)) {
            mat.forEach((m) => m?.dispose?.());
          } else {
            mat?.dispose?.();
          }
        });
      }

      renderer.dispose();

      if (
        container.contains(renderer.domElement)
      ) {
        container.removeChild(
          renderer.domElement
        );
      }

      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mountRef}
        className="w-full h-full"
        style={{
          minHeight: "460px",
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-[3px] border-[#f5a623] border-t-transparent rounded-full animate-spin mx-auto mb-3" />

            <p className="text-[#777] text-sm">
              Loading model...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-red-500 text-sm">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SlamBotArchitecture() {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundColor: "#111111",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-10 lg:px-16 py-14">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
            Slam Bot Architecture
          </h1>

          <p className="mt-3 text-[#999999] text-[0.95rem]">
            AgroSmart SLAMBot for Farming in Hilly Terrains
          </p>
        </div>

        {/* MAIN */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-[460px] shrink-0">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 flex flex-col gap-4 transition-colors duration-200"
                style={{
                  backgroundColor: "#1d1d1d",
                  border: "1px solid #292929",
                }}
              >
                <div className="text-white">
                  {feature.icon}
                </div>

                <div>
                  <h3 className="text-white font-semibold text-[0.93rem] mb-2 leading-snug">
                    {feature.title}
                  </h3>

                  <p className="text-[#888] text-[0.84rem] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* MODEL */}
          <div
            className="flex-1 w-full"
            style={{
              minHeight: "480px",
            }}
          >
            <RobotModelViewer />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-wrap gap-4 mt-12">
          <button
            className="font-bold text-sm px-6 py-3 rounded-lg text-black"
            style={{
              backgroundColor: "#f5a623",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#e09510")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "#f5a623")
            }
          >
            Structure Documentation
          </button>

          <button
            className="font-semibold text-sm px-6 py-3 rounded-lg text-white transition-colors duration-200"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #555",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor =
                "#888")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor =
                "#555")
            }
          >
            GitHub Repository
          </button>
        </div>

      </div>
    </div>
  );
}