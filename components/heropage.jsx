"use client";

import { useEffect, useRef } from "react";

import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function HeroLandingPage() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;

    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // PERFECT SAVED CAMERA POSITION
    camera.position.set(
      -33.02,
      -4.10,
      13.97
    );

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;

    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    // DISABLE USER MOVEMENT
    controls.enableRotate = false;

    controls.enableZoom = false;

    controls.enablePan = false;

    // PERFECT SAVED TARGET
    controls.target.set(
      -1.73,
      -7.17,
      21.13
    );

    controls.update();

    // LIGHTS
    const ambientLight =
      new THREE.AmbientLight(0xffffff, 2.8);

    scene.add(ambientLight);

    const keyLight =
      new THREE.DirectionalLight(
        0xffffff,
        3
      );

    keyLight.position.set(
      5,
      10,
      7
    );

    scene.add(keyLight);

    const rimLight =
      new THREE.DirectionalLight(
        0xffffff,
        1.2
      );

    rimLight.position.set(
      -5,
      4,
      -3
    );

    scene.add(rimLight);

    // SUNSET BACKGROUND
    const textureLoader =
      new THREE.TextureLoader();

    textureLoader.load(
      "/sunset-sky-bg.jpg",

      (texture) => {
        texture.colorSpace =
          THREE.SRGBColorSpace;

        scene.background = texture;
      }
    );

    // DRACO
    const dracoLoader =
      new DRACOLoader();

    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );

    // GLTF
    const loader = new GLTFLoader();

    loader.setDRACOLoader(
      dracoLoader
    );

    let model = null;

    // LOAD MODEL
    loader.load(
      "/models/heroLandingPage-v1.glb",

      (gltf) => {
        model = gltf.scene;

        // PERFECT SAVED MODEL POSITION
        model.position.set(
          25,
          -12.33,
          -19.63
        );

        // ROTATION
        model.rotation.set(
          0,
          0,
          0
        );

        // SCALE
        model.scale.setScalar(1);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;

            child.receiveShadow = true;
          }
        });

        scene.add(model);

        console.log(
          "MODEL LOADED"
        );
      },

      undefined,

      (err) => {
        console.error(
          "MODEL ERROR:",
          err
        );
      }
    );

    // ANIMATION
    let animationFrameId;

    const animate = () => {
      animationFrameId =
        requestAnimationFrame(
          animate
        );

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // RESIZE
    const handleResize = () => {
      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // CLEANUP
    return () => {
      cancelAnimationFrame(
        animationFrameId
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      controls.dispose();

      dracoLoader.dispose();

      renderer.dispose();

      if (
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }

      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* THREE.JS */}
      <div
        ref={mountRef}
        className="absolute inset-0"
      />

      {/* BLACK OVERLAY */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* CONTENT */}
      <div className="absolute inset-0 z-20 flex items-center">

        <div className="max-w-[680px] px-8 sm:px-14 lg:px-20">

          {/* HEADING */}
          <h1 className="text-white font-black tracking-tight leading-none text-[3rem] sm:text-[4rem] lg:text-[5rem]">

            AGROBOT
            <span className="text-[#f5a623]">
              .ai
            </span>

          </h1>

          {/* DESCRIPTION */}
          <p className="mt-6 text-[#d1d1d1] text-[1rem] sm:text-[1.1rem] leading-relaxed max-w-[560px]">

            AgroBot combines AI, sensors,
            automation, and precision farming
            technologies to monitor crops,
            detect diseases early, and optimize
            agricultural productivity efficiently.

          </p>

          {/* BUTTONS */}
          <div className="mt-8 flex gap-4">

            <button
              className="px-8 py-4 rounded-2xl font-semibold text-black transition-all duration-300 hover:scale-[1.03]"
              style={{
                backgroundColor:
                  "#f5a623",
              }}
            >
              Explore
            </button>

            <button
              className="px-8 py-4 rounded-2xl border border-[#555] text-white font-semibold backdrop-blur-md hover:border-[#888] transition-all duration-300"
              style={{
                backgroundColor:
                  "rgba(255,255,255,0.04)",
              }}
            >
              Learn More
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}