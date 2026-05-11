"use client";

import { useEffect, useRef, useState } from "react";

import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function HeroLandingPage() {
  const mountRef = useRef(null);

  const [backgroundLoaded, setBackgroundLoaded] =
    useState(false);

  useEffect(() => {
    const container = mountRef.current;

    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera =
      new THREE.PerspectiveCamera(
        40,
        window.innerWidth /
          window.innerHeight,
        0.1,
        1000
      );

    // SAVED CAMERA POSITION
    camera.position.set(
      -33.02,
      -4.10,
      13.97
    );

    // RENDERER
    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference:
          "high-performance",
      });

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    // SOFTER LIGHTING
    renderer.toneMappingExposure =
      1.18;

    renderer.shadowMap.enabled = true;

    container.appendChild(
      renderer.domElement
    );

    // CONTROLS
    const controls =
      new OrbitControls(
        camera,
        renderer.domElement
      );

    // DISABLE MOVEMENT
    controls.enableRotate = false;

    controls.enableZoom = false;

    controls.enablePan = false;

    // TARGET
    controls.target.set(
      -1.73,
      -7.17,
      21.13
    );

    controls.update();

    // LIGHTS
    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        2.5
      );

    scene.add(ambientLight);

    const keyLight =
      new THREE.DirectionalLight(
        0xffffff,
        2.4
      );

    keyLight.position.set(
      5,
      10,
      7
    );

    scene.add(keyLight);

    const rimLight =
      new THREE.DirectionalLight(
        0xffd9a0,
        1.2
      );

    rimLight.position.set(
      -5,
      4,
      -3
    );

    scene.add(rimLight);

    // WARM SUNSET LIGHT
    const warmLight =
      new THREE.PointLight(
        0xff8a3d,
        1.2,
        80
      );

    warmLight.position.set(
      10,
      15,
      10
    );

    scene.add(warmLight);

    // SUNSET SKY
    const textureLoader =
      new THREE.TextureLoader();

    textureLoader.load(
      "/sunset-sky-bg.jpg",

      (texture) => {
        texture.colorSpace =
          THREE.SRGBColorSpace;

        scene.background = texture;

        setBackgroundLoaded(true);

        console.log(
          "SUNSET SKY LOADED"
        );
      },

      undefined,

      (error) => {
        console.error(
          "BACKGROUND ERROR:",
          error
        );

        // FALLBACK COLOR
        scene.background =
          new THREE.Color(
            "#d36b2c"
          );
      }
    );

    // DRACO
    const dracoLoader =
      new DRACOLoader();

    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );

    // GLTF
    const loader =
      new GLTFLoader();

    loader.setDRACOLoader(
      dracoLoader
    );

    // LOAD MODEL
    loader.load(
      "/models/heroLandingPage-v1.glb",

      (gltf) => {
        const model =
          gltf.scene;

        // MODEL POSITION
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
        model.scale.setScalar(
          1
        );

        model.traverse(
          (child) => {
            if (child.isMesh) {
              child.castShadow = true;

              child.receiveShadow = true;

              // PREMIUM MATERIAL
              if (
                child.material
              ) {
                child.material.roughness =
                  0.45;

                child.material.metalness =
                  0.35;
              }
            }
          }
        );

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
    const handleResize =
      () => {
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

      {/* OVERLAY */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(95deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.04) 100%)",
        }}
      />

      {/* CONTENT */}
      <div className="absolute inset-0 z-20 flex items-center">

        <div className="max-w-[520px] px-8 sm:px-14 lg:px-20">

          {/* HEADING */}
          <h1 className="text-white font-black tracking-[-0.04em] leading-none text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem] drop-shadow-2xl">

            AGROBOT

            <span className="text-[#f5a623]">
              .ai
            </span>

          </h1>

          {/* DESCRIPTION */}
          <p className="mt-5 text-[#d6d6d6] text-[0.82rem] sm:text-[0.9rem] leading-relaxed max-w-[470px] drop-shadow-md">

            AgroBot combines AI,
            sensors, automation,
            and precision farming
            technologies to monitor
            crops, detect diseases
            early, and optimize
            agricultural productivity
            efficiently.

          </p>

          {/* BUTTONS */}
          <div className="mt-7 flex gap-4">

            {/* EXPLORE */}
            <button
              className="px-6 py-3 rounded-[16px] font-semibold text-black transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
              style={{
                backgroundColor:
                  "#f5a623",
              }}
            >
              Explore
            </button>

            {/* LEARN MORE */}
            <button
              className="px-6 py-3 rounded-[16px] border border-[#666] text-white font-semibold backdrop-blur-md hover:border-[#999] transition-all duration-300"
              style={{
                backgroundColor:
                  "rgba(255,255,255,0.06)",
              }}
            >
              Learn More
            </button>

          </div>

        </div>

      </div>

      {/* LOADING */}
      {!backgroundLoaded && (
        <div className="absolute bottom-5 right-5 z-50 text-white/50 text-xs">

          Loading Sunset Sky...

        </div>
      )}

    </div>
  );
}