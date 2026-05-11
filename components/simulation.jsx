"use client";

/**
 * AgroBot Realistic Farm Simulation
 * ────────────────────────────────────────────────────────────
 * A photorealistic green Indian agricultural farm simulation
 * with custom AgroBot model, proper environment, lush crops,
 * farm buildings, trees, ponds, dirt paths, and bright blue sky.
 */

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, Cloud, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ─── FARM LAYOUT CONSTANTS ────────────────────────────────────────────────────
const ROWS        = 26;
const COLS        = 30;
const ROW_GAP     = 2.6;
const COL_GAP     = 1.4;
const FIELD_W     = COLS * COL_GAP;
const FIELD_D     = ROWS * ROW_GAP;
const HW          = FIELD_W / 2;
const HD          = FIELD_D / 2;

const rz = (r) => -HD + r * ROW_GAP + ROW_GAP / 2;
const cx = (c) => -HW + c * COL_GAP + COL_GAP / 2;

const DISEASED = new Set([
  "4_6","4_7","5_6","5_7","5_8",
  "10_15","10_16","11_15","11_16",
  "18_3","18_4","19_3",
]);

const BOTS = [
  { id:"AB-001", label:"Disease Detection",  assignedRow:4,  speed:0.022, battery:87, sprayColor:"#ff3300" },
  { id:"AB-002", label:"Precision Spraying", assignedRow:10, speed:0.018, battery:63, sprayColor:"#44aaff" },
  { id:"AB-003", label:"Soil Analysis",      assignedRow:14, speed:0.015, battery:94, sprayColor:"#44aaff" },
  { id:"AB-004", label:"Irrigation",         assignedRow:18, speed:0.020, battery:45, sprayColor:"#44aaff" },
  { id:"AB-005", label:"Crop Inspection",    assignedRow:22, speed:0.017, battery:78, sprayColor:"#44aaff" },
];

// ─── CUSTOM AGROBOT MODEL COMPONENT ───────────────────────────────────────────
function CustomAgroBot({ def, timeRef, position, rotationY }) {
  const groupRef = useRef();
  const sprayRef = useRef();
  const scanRingRef = useRef();
  const state = useRef({ x: position[0], dir: 1 });
  
  // Load custom model
  const { scene: modelScene } = useGLTF('/models/AgroBotModel-v1.glb');
  
  // Clone the model for this instance
  const model = useMemo(() => {
    const cloned = modelScene.clone();
    // Apply 90-degree rotation on Y-axis to make model face forward
    // cloned.rotation.y = Math.PI / 2;
    // Scale the model appropriately
    cloned.scale.setScalar(0.8);
    return cloned;
  }, [modelScene]);

  const z = rz(def.assignedRow);

  useFrame(() => {
    const s = state.current;
    s.x += s.dir * def.speed;
    if (s.x > HW - 1.5) s.dir = -1;
    if (s.x < -HW + 1.5) s.dir = 1;

    if (groupRef.current) {
      groupRef.current.position.x = s.x;
      groupRef.current.rotation.y = s.dir > 0 ? 0 : Math.PI;
    }

    if (sprayRef.current) {
      sprayRef.current.material.opacity = 0.3 + Math.sin(timeRef.current * 5) * 0.2;
      sprayRef.current.scale.y = 0.9 + Math.sin(timeRef.current * 4) * 0.15;
    }

    if (scanRingRef.current) {
      const sc = 0.85 + Math.sin(timeRef.current * 2.2) * 0.25;
      scanRingRef.current.scale.set(sc, sc, sc);
      scanRingRef.current.material.opacity = 0.4 + Math.sin(timeRef.current * 2.2) * 0.3;
    }
  });

  const hasSpray = def.label.includes("Spray") || def.label.includes("Irrigation");
  const hasScan = def.label.includes("Disease") || def.label.includes("Inspection");

  return (
    <group ref={groupRef} position={[state.current.x, 0.9, z]}>
      {/* Custom 3D Model */}
      <primitive object={model} scale={0.13} position={[0, 0, 0]} />
      
      {/* Orange LED indicator */}
      <pointLight color="#FF6B00" intensity={1.2} distance={5} position={[0, 0.6, 0]} />
      
      {/* Small LED glow effect */}
      <mesh position={[0, 0.65, 0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={2} />
      </mesh>

      {/* Spray effect for relevant bots */}
      {hasSpray && (
        <mesh ref={sprayRef} position={[0, 0.3, 1.2]}>
          <coneGeometry args={[0.25, 0.5, 8, 1, true]} />
          <meshBasicMaterial
            color={def.sprayColor}
            transparent opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Scan ring effect for disease detection bots */}
      {hasScan && (
        <mesh ref={scanRingRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.0, 32]} />
          <meshBasicMaterial color="#FF6B00" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload('/models/AgroBotModel-v1.glb');

function smoothNoise(x, z) {
  return (
    Math.sin(x * 0.13 + 1.7) * Math.cos(z * 0.11 + 2.3) * 0.5 +
    Math.sin(x * 0.27 - 0.9) * Math.cos(z * 0.21 + 1.1) * 0.3 +
    Math.sin(x * 0.05 + 3.1) * Math.cos(z * 0.07 - 0.5) * 0.8
  );
}

function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, 120, 120);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      const hill = Math.max(0, (dist - 60) * 0.04);
      pos.setY(i, smoothNoise(x, z) * 0.6 + hill * hill * 0.5);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <meshLambertMaterial color="#4a6b2a" />
    </mesh>
  );
}

function FieldBed() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(FIELD_W + 2, FIELD_D + 2, 40, 50);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getY(i);
      const furrow = Math.sin(z * (Math.PI / ROW_GAP) * 2) * 0.04;
      pos.setZ(i, furrow);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <meshLambertMaterial color="#6b4423" />
    </mesh>
  );
}

function GrassPatches() {
  const patches = useMemo(() => {
    const p = [];
    const offsets = [
      { x: 0, z: -HD - 6, w: FIELD_W + 30, d: 10 },
      { x: 0, z:  HD + 6, w: FIELD_W + 30, d: 10 },
      { x: -HW - 8, z: 0, w: 14, d: FIELD_D + 20 },
      { x:  HW + 8, z: 0, w: 14, d: FIELD_D + 20 },
    ];
    offsets.forEach((o, i) => p.push(
      <mesh key={i} position={[o.x, 0.02, o.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[o.w, o.d]} />
        <meshLambertMaterial color="#3d6b1a" />
      </mesh>
    ));
    return p;
  }, []);
  return <group>{patches}</group>;
}

const CropPlant = ({ x, z, height, isDiseased, phase, timeRef }) => {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const t = timeRef.current;
    ref.current.rotation.z = Math.sin(t * 1.0 + phase) * 0.04;
    ref.current.rotation.x = Math.sin(t * 0.7 + phase + 1.2) * 0.025;
  });

  const stalkColor = isDiseased ? "#8a6a20" : "#2d6b10";
  const leafColor = isDiseased ? "#7a9a30" : new THREE.Color()
    .setHSL(0.28 + (Math.random() - 0.5) * 0.03, 0.65 + Math.random() * 0.2, 0.25 + Math.random() * 0.1);

  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh castShadow position={[0, height * 0.4, 0]}>
        <cylinderGeometry args={[0.025, 0.04, height * 0.8, 5]} />
        <meshLambertMaterial color={stalkColor} />
      </mesh>
      <mesh castShadow position={[0, height * 0.78, 0]}>
        <coneGeometry args={[0.18 + Math.random() * 0.07, height * 0.5, 6]} />
        <meshLambertMaterial color={leafColor} />
      </mesh>
      <mesh castShadow position={[0.04, height * 0.55, 0.04]} rotation={[0.2, 0.8, 0]}>
        <coneGeometry args={[0.12, height * 0.3, 5]} />
        <meshLambertMaterial color={leafColor} />
      </mesh>
    </group>
  );
};

function CropField({ timeRef }) {
  const plants = useMemo(() => {
    const arr = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r}_${c}`;
        arr.push({
          key,
          x: cx(c) + (Math.random() - 0.5) * 0.15,
          z: rz(r) + (Math.random() - 0.5) * 0.15,
          height: 0.65 + Math.random() * 0.45,
          isDiseased: DISEASED.has(key),
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {plants.map(p => (
        <CropPlant key={p.key} {...p} timeRef={timeRef} />
      ))}
    </group>
  );
}

function DiseaseMarkers({ timeRef }) {
  const markers = useMemo(() =>
    Array.from(DISEASED).map(k => {
      const [r, c] = k.split("_").map(Number);
      return { x: cx(c), z: rz(r) };
    }), []);

  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.children.forEach((m, i) => {
        m.material.opacity = 0.15 + Math.sin(timeRef.current * 2 + i) * 0.1;
      });
    }
  });

  return (
    <group ref={ref}>
      {markers.map((m, i) => (
        <mesh key={i} position={[m.x, 0.08, m.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 12]} />
          <meshBasicMaterial color="#ff2200" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ x, z, scale = 1, variety = 0 }) {
  const trunkH = (2.5 + Math.random() * 1.5) * scale;
  const canopyColors = ["#1a5c0e", "#2d7a18", "#1e6b12", "#245c0a", "#3a8020"];
  const cc = canopyColors[variety % canopyColors.length];

  if (variety === 0) {
    return (
      <group position={[x, 0, z]}>
        <mesh castShadow position={[0, trunkH * 0.5, 0]}>
          <cylinderGeometry args={[0.18 * scale, 0.28 * scale, trunkH, 7]} />
          <meshLambertMaterial color="#4a2e0e" />
        </mesh>
        <mesh castShadow position={[0, trunkH + 1.2 * scale, 0]}>
          <sphereGeometry args={[2.2 * scale, 10, 8]} />
          <meshLambertMaterial color={cc} />
        </mesh>
        <mesh castShadow position={[0.8 * scale, trunkH + 0.6 * scale, 0.5 * scale]}>
          <sphereGeometry args={[1.4 * scale, 8, 6]} />
          <meshLambertMaterial color={canopyColors[(variety + 1) % 5]} />
        </mesh>
      </group>
    );
  } else if (variety === 1) {
    return (
      <group position={[x, 0, z]}>
        <mesh castShadow position={[0, trunkH * 0.5, 0]} rotation={[0, 0, 0.08]}>
          <cylinderGeometry args={[0.12 * scale, 0.2 * scale, trunkH * 1.4, 7]} />
          <meshLambertMaterial color="#6b4a20" />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <mesh key={i} castShadow
            position={[
              Math.cos(i / 6 * Math.PI * 2) * 1.5 * scale,
              trunkH * 1.35,
              Math.sin(i / 6 * Math.PI * 2) * 1.5 * scale,
            ]}
            rotation={[0.5, i / 6 * Math.PI * 2, 0]}
          >
            <boxGeometry args={[0.08 * scale, 0.04 * scale, 2.2 * scale]} />
            <meshLambertMaterial color="#2a6b10" />
          </mesh>
        ))}
      </group>
    );
  } else {
    return (
      <group position={[x, 0, z]}>
        <mesh castShadow position={[0, trunkH * 0.5, 0]}>
          <cylinderGeometry args={[0.14 * scale, 0.22 * scale, trunkH, 6]} />
          <meshLambertMaterial color="#3d2810" />
        </mesh>
        <mesh castShadow position={[0, trunkH + 1.0 * scale, 0]}>
          <coneGeometry args={[1.6 * scale, 3.0 * scale, 8]} />
          <meshLambertMaterial color={cc} />
        </mesh>
        <mesh castShadow position={[0, trunkH + 2.2 * scale, 0]}>
          <coneGeometry args={[1.0 * scale, 2.0 * scale, 8]} />
          <meshLambertMaterial color={canopyColors[(variety + 2) % 5]} />
        </mesh>
      </group>
    );
  }
}

function TreeLines() {
  const trees = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 16; i++) {
      arr.push({ x: -HW - 10 - Math.random() * 4, z: -HD + i * (FIELD_D / 15) + (Math.random() - 0.5) * 3, scale: 0.9 + Math.random() * 0.4, variety: i % 3 });
    }
    for (let i = 0; i < 16; i++) {
      arr.push({ x: HW + 10 + Math.random() * 4, z: -HD + i * (FIELD_D / 15) + (Math.random() - 0.5) * 3, scale: 0.9 + Math.random() * 0.4, variety: (i + 1) % 3 });
    }
    for (let i = 0; i < 14; i++) {
      arr.push({ x: -HW - 5 + i * ((FIELD_W + 10) / 13), z: -HD - 10 - Math.random() * 5, scale: 1.0 + Math.random() * 0.4, variety: (i + 2) % 3 });
    }
    for (let i = 0; i < 8; i++) {
      arr.push({ x: -HW + i * 8 + (Math.random() - 0.5) * 3, z: HD + 12 + Math.random() * 6, scale: 1.1 + Math.random() * 0.3, variety: i % 3 });
    }
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 80 + Math.random() * 60;
      arr.push({ x: Math.cos(angle) * dist, z: Math.sin(angle) * dist - 20, scale: 1.2 + Math.random() * 0.8, variety: Math.floor(Math.random() * 3) });
    }
    return arr;
  }, []);

  return (
    <group>
      {trees.map((t, i) => <Tree key={i} {...t} />)}
    </group>
  );
}

function Hedgerows() {
  const segments = useMemo(() => {
    const s = [];
    for (let c = 0; c < Math.floor(FIELD_W / 1.8); c++) {
      s.push({ x: -HW + c * 1.8, z: -HD - 1.5 });
    }
    return s;
  }, []);

  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={i} castShadow position={[s.x, 0.4, s.z]}>
          <boxGeometry args={[1.4, 0.9, 0.7]} />
          <meshLambertMaterial color="#1a5c0a" />
        </mesh>
      ))}
    </group>
  );
}

function DirtPaths() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[HW + 4, 0.03, 0]}>
        <planeGeometry args={[3.5, FIELD_D + 20]} />
        <meshLambertMaterial color="#7a5630" />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, HD + 5]}>
        <planeGeometry args={[FIELD_W + 20, 3.5]} />
        <meshLambertMaterial color="#7a5630" />
      </mesh>
      {BOTS.map((b, i) => (
        <mesh key={i} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, rz(b.assignedRow)]}>
          <planeGeometry args={[FIELD_W, 0.6]} />
          <meshLambertMaterial color="#5a3e20" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function IrrigationSystem() {
  const laterals = useMemo(() => {
    const arr = [];
    for (let r = 1; r < ROWS; r += 2) {
      arr.push(r);
    }
    return arr;
  }, []);

  return (
    <group>
      <mesh position={[-HW - 0.8, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, FIELD_D + 2, 8]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.4} metalness={0.8} />
      </mesh>
      {laterals.map(r => (
        <mesh key={r} position={[0, 0.1, rz(r)]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, FIELD_W, 8]} />
          <meshStandardMaterial color="#263040" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {laterals.map(r =>
        [3, 7, 11, 15, 19, 23, 27].map(c => (
          <mesh key={`${r}_${c}`} position={[cx(c), 0.08, rz(r)]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial color="#1a3a5a" metalness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

function WaterFeatures({ timeRef }) {
  const waterRef = useRef();
  useFrame(() => {
    if (waterRef.current) {
      waterRef.current.material.opacity = 0.72 + Math.sin(timeRef.current * 0.8) * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[-HW - 18, 0.05, -HD + 12]}>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#1a6090" transparent opacity={0.75} roughness={0.05} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-HW - 18, 0.02, -HD + 12]}>
        <ringGeometry args={[5.5, 7.5, 32]} />
        <meshLambertMaterial color="#3d4a20" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-HW - 6, 0.04, -HD + 8]}>
        <planeGeometry args={[1.2, 16]} />
        <meshStandardMaterial color="#1a5070" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Farmhouse() {
  return (
    <group position={[HW + 12, 0, HD - 8]}>
      <mesh castShadow receiveShadow position={[0, 2.0, 0]}>
        <boxGeometry args={[8, 4, 6]} />
        <meshLambertMaterial color="#d4b896" />
      </mesh>
      <mesh castShadow position={[0, 4.8, 0]}>
        <coneGeometry args={[6, 2.5, 4]} rotation={[0, Math.PI / 4, 0]} />
        <meshLambertMaterial color="#8b3a1a" />
      </mesh>
      <mesh position={[0, 0.9, 3.05]}>
        <boxGeometry args={[1.2, 1.8, 0.1]} />
        <meshLambertMaterial color="#5c3010" />
      </mesh>
      {[[-2.5, 2.2, 3.05], [2.5, 2.2, 3.05]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[1.1, 0.9, 0.1]} />
          <meshStandardMaterial color="#aaddff" roughness={0.05} metalness={0.2} transparent opacity={0.8} />
        </mesh>
      ))}
      <mesh castShadow position={[6, 1.2, 1]}>
        <boxGeometry args={[3.5, 2.4, 3]} />
        <meshLambertMaterial color="#c4a870" />
      </mesh>
      <mesh castShadow position={[6, 2.6, 1]}>
        <boxGeometry args={[4, 0.3, 3.5]} />
        <meshLambertMaterial color="#6b3010" />
      </mesh>
    </group>
  );
}

function WaterTank() {
  return (
    <group position={[HW + 22, 0, -5]}>
      {[[-1.2, 0, -1.2], [1.2, 0, -1.2], [-1.2, 0, 1.2], [1.2, 0, 1.2]].map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, 3, z]}>
          <cylinderGeometry args={[0.1, 0.12, 6, 6]} />
          <meshStandardMaterial color="#555" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 6.5, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 2.8, 16]} />
        <meshStandardMaterial color="#2a4a6b" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 7.9, 0]}>
        <sphereGeometry args={[1.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a3a5a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
        <meshStandardMaterial color="#333" metalness={0.9} />
      </mesh>
    </group>
  );
}

function Fence() {
  const posts = useMemo(() => {
    const arr = [];
    const spacing = 3.5;
    const hw2 = HW + 2, hd2 = HD + 2;
    for (let x = -hw2; x <= hw2; x += spacing) arr.push({ x, z: -hd2 });
    for (let x = -hw2; x <= hw2; x += spacing) arr.push({ x, z: hd2 });
    for (let z = -hd2; z <= hd2; z += spacing) arr.push({ x: -hw2, z });
    for (let z = -hd2; z <= hd2; z += spacing) arr.push({ x: hw2, z });
    return arr;
  }, []);

  return (
    <group>
      {posts.map((p, i) => (
        <mesh key={i} castShadow position={[p.x, 0.55, p.z]}>
          <cylinderGeometry args={[0.06, 0.07, 1.1, 5]} />
          <meshLambertMaterial color="#6b3a10" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.85, -HD - 2]}>
        <planeGeometry args={[FIELD_W + 4, 0.06]} />
        <meshLambertMaterial color="#8b5a20" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.85, HD + 2]}>
        <planeGeometry args={[FIELD_W + 4, 0.06]} />
        <meshLambertMaterial color="#8b5a20" />
      </mesh>
    </group>
  );
}

function InspectionDrone({ timeRef }) {
  const ref   = useRef();
  const angle = useRef(0);
  useFrame((_, delta) => {
    angle.current += delta * 0.5;
    if (ref.current) {
      ref.current.position.x = Math.cos(angle.current) * 22;
      ref.current.position.z = Math.sin(angle.current) * 16 - 10;
      ref.current.position.y = 14 + Math.sin(timeRef.current * 0.4) * 1.5;
      ref.current.rotation.y = angle.current + Math.PI / 2;
    }
  });

  return (
    <group ref={ref} position={[22, 14, -10]}>
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.1, 0.42]} />
        <meshStandardMaterial color="#111318" roughness={0.1} metalness={0.95} />
      </mesh>
      {[[ 0.32, 0, 0.32], [-0.32, 0, 0.32], [ 0.32, 0,-0.32], [-0.32, 0,-0.32]].map(([ax, ay, az], i) => (
        <group key={i} position={[ax, ay, az]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.012, 10]} />
            <meshStandardMaterial color="#FF6B00" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
      <pointLight color="#FF6B00" intensity={1.0} distance={5} />
    </group>
  );
}

function Clouds() {
  return (
    <>
      <Cloud position={[-40, 38, -80]} speed={0.2} opacity={0.55} args={[10, 2]} />
      <Cloud position={[30, 42, -90]}  speed={0.15} opacity={0.45} args={[8, 2]} />
      <Cloud position={[80, 36, -70]}  speed={0.18} opacity={0.5}  args={[12, 2]} />
      <Cloud position={[-70, 40, -60]} speed={0.22} opacity={0.4}  args={[9, 2]} />
    </>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight color="#ffffff" intensity={0.65} />
      <directionalLight
        color="#ffffff"
        intensity={1.2}
        position={[20, 35, 10]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={280}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0008}
      />
      <directionalLight color="#88aaff" intensity={0.4} position={[-20, 20, -30]} />
      <hemisphereLight skyColor="#87CEEB" groundColor="#4a6b2a" intensity={0.5} />
    </>
  );
}

function FarmScene() {
  const timeRef = useRef(0);
  useFrame((_, delta) => { timeRef.current += delta; });

  return (
    <>
      <Lighting />
      
      {/* Blue Sky Background */}
      <color attach="background" args={['#87CEEB']} />
      
      <Clouds />
      <Terrain />
      <GrassPatches />
      <FieldBed />
      <DirtPaths />
      <Fence />
      <IrrigationSystem />
      <WaterFeatures timeRef={timeRef} />
      <Hedgerows />
      <TreeLines />
      <Farmhouse />
      <WaterTank />
      <CropField timeRef={timeRef} />
      <DiseaseMarkers timeRef={timeRef} />
      {BOTS.map(def => (
        <CustomAgroBot 
          key={def.id} 
          def={def} 
          timeRef={timeRef} 
          position={[-HW + 1, 0, 0]}
        />
      ))}
      <InspectionDrone timeRef={timeRef} />
    </>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export default function AgroBotFarm() {
  return (
    <div style={{ width:"100vw", height:"100vh", position:"relative", background:"#87CEEB", overflow:"hidden" }}>
      <Canvas
        shadows
        camera={{ position:[15, 35, 45], fov:50, near:0.1, far:600 }}
        gl={{ antialias:true, toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.3 }}
        style={{ position:"absolute", inset:0 }}
      >
        <Suspense fallback={null}>
          <FarmScene />
        </Suspense>

        {/* Controls disabled - user cannot interact */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          enableDamping={false}
        />
      </Canvas>
    </div>
  );
}