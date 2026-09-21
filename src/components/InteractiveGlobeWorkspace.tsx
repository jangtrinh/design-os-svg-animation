import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

const TOKENS = {
  bgLight: "#FAF9F5",
  bgDark: "#121214",
  panelDark: "#27272A",
  panelBorder: "#3F3F46",
  accentClaude: "#D96B43",
  emeraldGlow: "#34D399",
  emeraldBase: "#10B981",
  easeSpring: [0.16, 1, 0.3, 1] as const,
};

const GLOBE_RADIUS = 2.2;

export const MOCK_CITIES = [
  { id: "tokyo", name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { id: "nyc", name: "New York", lat: 40.7128, lng: -74.006 },
  { id: "london", name: "London", lat: 51.5074, lng: -0.1278 },
  { id: "paris", name: "Paris", lat: 48.8566, lng: 2.3522 },
  { id: "sf", name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { id: "sydney", name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { id: "singapore", name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { id: "berlin", name: "Berlin", lat: 52.52, lng: 13.405 },
  { id: "seoul", name: "Seoul", lat: 37.5665, lng: 126.978 },
  { id: "dubai", name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { id: "saopaulo", name: "São Paulo", lat: -23.5505, lng: -46.6333 },
  { id: "cairo", name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { id: "mumbai", name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { id: "capetown", name: "Cape Town", lat: -33.9249, lng: 18.4241 },
  { id: "mexico", name: "Mexico City", lat: 19.4326, lng: -99.1332 },
  { id: "buenosaires", name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  { id: "toronto", name: "Toronto", lat: 43.6532, lng: -79.3832 },
  { id: "nairobi", name: "Nairobi", lat: -1.2921, lng: 36.8219 },
  { id: "reykjavik", name: "Reykjavik", lat: 64.1466, lng: -21.9426 },
  { id: "bangkok", name: "Bangkok", lat: 13.7563, lng: 100.5018 },
];

export const MOCK_CONNECTIONS: [string, string][] = [
  ["nyc", "london"],
  ["london", "tokyo"],
  ["sf", "tokyo"],
  ["paris", "berlin"],
  ["tokyo", "sydney"],
  ["london", "dubai"],
  ["dubai", "singapore"],
  ["singapore", "sydney"],
  ["nyc", "saopaulo"],
  ["london", "cairo"],
  ["cairo", "mumbai"],
  ["sf", "seoul"],
  ["seoul", "tokyo"],
  ["toronto", "paris"],
  ["mexico", "buenosaires"],
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export interface GlobeTweaks {
  theme: "dark" | "light";
  breakpoint: "desktop" | "tablet" | "mobile";
  arcWidth: number;
  arcGlow: number;
  citySize: number;
  gridOpacity: number;
  rotationSpeed: number;
  tilt: number;
}

// Atmospheric Rim Lighting Shader (NASA/Apple Limb & Fresnel Glow)
const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewVec;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewVec = normalize(-mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewVec;
    uniform vec3 uColor;
    uniform float uIntensity;
    void main() {
      float fresnel = dot(vNormal, vViewVec);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      float glow = pow(fresnel, 2.8) * uIntensity;
      gl_FragColor = vec4(uColor, glow);
    }
  `,
};

const GlobeScene: React.FC<{ tweaks: GlobeTweaks }> = ({ tweaks }) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const pingRingsRef = useRef<THREE.Group>(null);
  const packetGroupRef = useRef<THREE.Group>(null);

  const cityPositions = useMemo(() => {
    return MOCK_CITIES.map((c) => ({
      ...c,
      pos: latLngToVector3(c.lat, c.lng, GLOBE_RADIUS),
    }));
  }, []);

  const rawCurves = useMemo(() => {
    const cityMap = new Map(cityPositions.map((c) => [c.id, c.pos]));
    return MOCK_CONNECTIONS.map(([src, dst]) => {
      const p1 = cityMap.get(src)!;
      const p2 = cityMap.get(dst)!;
      const dist = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const control = mid.normalize().multiplyScalar(GLOBE_RADIUS * 1.2 + dist * 0.1);
      return new THREE.QuadraticBezierCurve3(p1, control, p2);
    });
  }, [cityPositions]);

  const arcCurves = useMemo(() => {
    return rawCurves.map((curve, idx) => ({
      id: `arc-${idx}`,
      points: curve.getPoints(40),
    }));
  }, [rawCurves]);

  const gridGeometries = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const r = GLOBE_RADIUS * 1.002;
    for (let lat = -60; lat <= 60; lat += 30) {
      const ring: THREE.Vector3[] = [];
      for (let lng = -180; lng <= 180; lng += 10) ring.push(latLngToVector3(lat, lng, r));
      lines.push(ring);
    }
    for (let lng = -180; lng < 180; lng += 30) {
      const line: THREE.Vector3[] = [];
      for (let lat = -85; lat <= 85; lat += 5) line.push(latLngToVector3(lat, lng, r));
      lines.push(line);
    }
    return lines;
  }, []);

  useFrame((state, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * (tweaks.rotationSpeed * 0.08);
      globeGroupRef.current.rotation.x = (tweaks.tilt * Math.PI) / 180;
    }
    if (pingRingsRef.current) {
      const time = state.clock.getElapsedTime();
      const progress = (time % 2.0) / 2.0;
      const scale = 1.0 + progress * 1.6;
      const opacity = (1.0 - progress) * 0.8;
      pingRingsRef.current.children.forEach((c) => {
        c.scale.set(scale, scale, scale);
        const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = opacity;
      });
    }
    // Animate traveling light pulse packets along great-circle arcs
    if (packetGroupRef.current) {
      const time = state.clock.getElapsedTime();
      packetGroupRef.current.children.forEach((child, idx) => {
        const curve = rawCurves[idx % rawCurves.length];
        if (curve) {
          const tProgress = ((time * 0.35 + idx * 0.12) % 1.0);
          const pt = curve.getPoint(tProgress);
          child.position.copy(pt);
          const scale = 1.0 + Math.sin(tProgress * Math.PI) * 0.5;
          child.scale.set(scale, scale, scale);
        }
      });
    }
  });

  const cityScale = (tweaks.citySize / 4) * 0.038;
  const glowIntensity = (tweaks.arcGlow / 100) * 2.2;

  return (
    <group ref={globeGroupRef}>
      {/* 1. Core Globe Sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color={tweaks.theme === "dark" ? "#0A0A0C" : "#F0EFEA"}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* 2. Atmospheric Rim Lighting / Fresnel Glow Halo Mesh */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.045, 64, 64]} />
        <shaderMaterial
          vertexShader={AtmosphereShader.vertexShader}
          fragmentShader={AtmosphereShader.fragmentShader}
          uniforms={{
            uColor: { value: new THREE.Color(TOKENS.emeraldGlow) },
            uIntensity: { value: tweaks.theme === "dark" ? 0.75 : 0.4 },
          }}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {tweaks.gridOpacity > 0.01 && (
        <group>
          {gridGeometries.map((pts, i) => (
            <line key={`grid-${i}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color="#52525B"
                transparent
                opacity={tweaks.gridOpacity}
                depthWrite={false}
              />
            </line>
          ))}
        </group>
      )}

      {/* 3. Glowing Great-Circle Arcs */}
      <group>
        {arcCurves.map(({ id, points }) => (
          <line key={id}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={TOKENS.emeraldGlow}
              linewidth={tweaks.arcWidth}
              transparent
              opacity={Math.min(1.0, 0.4 + glowIntensity * 0.35)}
              depthWrite={false}
            />
          </line>
        ))}
      </group>

      {/* 4. Traveling Light Pulse Packets along Great-Circle Arcs */}
      <group ref={packetGroupRef}>
        {rawCurves.map((_, idx) => (
          <group key={`packet-${idx}`}>
            <mesh>
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshBasicMaterial
                color={TOKENS.emeraldGlow}
                transparent
                opacity={0.65}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. City Nodes */}
      <group>
        {cityPositions.map((city) => (
          <group key={city.id} position={city.pos}>
            <mesh>
              <sphereGeometry args={[cityScale, 16, 16]} />
              <meshBasicMaterial color={TOKENS.emeraldBase} />
            </mesh>
            <mesh>
              <sphereGeometry args={[cityScale * 1.5, 16, 16]} />
              <meshBasicMaterial
                color={TOKENS.emeraldGlow}
                transparent
                opacity={0.4}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. City Pulse Ping Rings */}
      <group ref={pingRingsRef}>
        {cityPositions.map((city) => (
          <mesh
            key={`ping-${city.id}`}
            position={city.pos}
            onUpdate={(s) => s.lookAt(0, 0, 0)}
          >
            <ringGeometry args={[cityScale * 1.2, cityScale * 1.8, 24]} />
            <meshBasicMaterial
              color={TOKENS.emeraldGlow}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Smooth Camera Lerp Damping Rig
const CameraRig: React.FC<{ tweaks: GlobeTweaks }> = ({ tweaks }) => {
  useFrame((state, delta) => {
    const baseDist = tweaks.breakpoint === "mobile" ? 6.8 : tweaks.breakpoint === "tablet" ? 6.0 : 5.4;
    const targetY = ((tweaks.tilt * Math.PI) / 180) * 1.25;
    const targetZ = baseDist;
    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    // Framerate-independent exponential decay damping
    const damping = 1 - Math.exp(-7 * delta);
    state.camera.position.lerp(targetPos, damping);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

export interface InteractiveGlobeWorkspaceProps {
  onNextScene?: () => void;
}

export const InteractiveGlobeWorkspace: React.FC<InteractiveGlobeWorkspaceProps> = ({
  onNextScene,
}) => {
  const [tweaks, setTweaks] = useState<GlobeTweaks>({
    theme: "dark",
    breakpoint: "desktop",
    arcWidth: 2.0,
    arcGlow: 80,
    citySize: 4,
    gridOpacity: 0.15,
    rotationSpeed: 3,
    tilt: 12,
  });

  const [isTweaksOpen, setIsTweaksOpen] = useState<boolean>(false);
  const [showTweaksPrompt, setShowTweaksPrompt] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string>(
    "Add sliders for arc width, glow, city size and responsive breakpoints."
  );
  const [isSoldering, setIsSoldering] = useState<boolean>(false);

  // Trigger Tweaks flow (Prompt -> Soldering... -> Drawer open)
  const handleOpenTweaks = () => {
    if (isTweaksOpen) {
      setIsTweaksOpen(false);
      return;
    }
    setShowTweaksPrompt(true);
  };

  const handleApplyTweaksPrompt = () => {
    setShowTweaksPrompt(false);
    setIsSoldering(true);
    setTimeout(() => {
      setIsSoldering(false);
      setIsTweaksOpen(true);
    }, 700);
  };

  return (
    <div className="flex w-full h-screen bg-[#121214] text-[#F4F4F5] overflow-hidden font-sans select-none relative">
      {/* 1. LEFT SIDEBAR (Workflow Steps) - Fixed 260px */}
      <aside className="w-[260px] h-full bg-[#18181B] border-r border-[#27272A] flex flex-col justify-between p-5 z-20 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 pb-6 border-b border-[#27272A]">
            <svg
              className="w-5 h-5 text-[#D96B43]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C12.5523 2 13 2.44772 13 3V8.17157L16.6569 4.51472C17.0474 4.12419 17.6805 4.12419 18.0711 4.51472C18.4616 4.90524 18.4616 5.53841 18.0711 5.92893L14.4142 9.58579H19.5858C20.1381 9.58579 20.5858 10.0335 20.5858 10.5858C20.5858 11.1381 20.1381 11.5858 19.5858 11.5858H14.4142L18.0711 15.2426C18.4616 15.6332 18.4616 16.2663 18.0711 16.6569C17.6805 17.0474 17.0474 17.0474 16.6569 16.6569L13 13V18.1716C13 18.7239 12.5523 19.1716 12 19.1716C11.4477 19.1716 11 18.7239 11 18.1716V13L7.34315 16.6569C6.95262 17.0474 6.31946 17.0474 5.92893 16.6569C5.53841 16.2663 5.53841 15.6332 5.92893 15.2426L9.58579 11.5858H4.41421C3.86193 11.5858 3.41421 11.1381 3.41421 10.5858C3.41421 10.0335 3.86193 9.58579 4.41421 9.58579H9.58579L5.92893 5.92893C5.53841 5.53841 5.53841 4.90524 5.92893 4.51472L11 8.17157V3C11 2.44772 11 2 12 2Z" />
            </svg>
            <span className="font-serif text-[17px] font-semibold text-[#F4F4F5]">
              Claude Design
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-4 text-[14px]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#059669]/20 flex items-center justify-center text-[#10B981]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Plan</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-[#D96B43] animate-spin">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
              <span className="font-mono text-[13px] text-[#F4F4F5]">write_file: globe.tsx</span>
            </div>

            <div className="flex items-center gap-3 text-[#10B981]">
              <div className="w-5 h-5 rounded-full bg-[#059669]/20 flex items-center justify-center text-[#10B981]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Render canvas</span>
            </div>
          </div>
        </div>

        {/* Progress 5/5 status pill */}
        <div className="pt-4 border-t border-[#27272A] flex flex-col gap-3">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#27272A] rounded-full text-[12px] font-medium text-[#A1A1AA]">
            <span>Workflow Status</span>
            <span className="text-[#10B981]">Progress 5/5</span>
          </div>

          {onNextScene && (
            <button
              onClick={onNextScene}
              className="w-full py-2 bg-[#27272A] hover:bg-[#3F3F46] text-[12px] text-[#A1A1AA] hover:text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Continue to Scene 3</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. CENTER: THREE.JS CANVAS */}
      <main className="flex-1 relative h-full">
        {/* Overlay Title */}
        <div className="absolute top-6 left-8 z-10 pointer-events-none">
          <h1 className="text-[32px] font-serif text-white tracking-tight drop-shadow-sm">
            Every place has a story.
          </h1>
          <p className="text-[13px] text-[#A1A1AA] mt-1 font-sans">
            Cultural exchange flows across global nodes
          </p>
        </div>

        {/* Top-Right Floating Controls */}
        <div className="absolute top-6 right-8 z-10 flex items-center gap-3">
          {isSoldering && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#18181B] border border-[#3F3F46] rounded-md text-[12px] text-[#D96B43] shadow-lg">
              <span className="font-medium">Soldering...</span>
              <div className="w-16 h-1 bg-[#27272A] rounded-full overflow-hidden">
                <div className="w-full h-full bg-[#D96B43] animate-[pulse_0.5s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          <button
            onClick={handleOpenTweaks}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer shadow-sm ${
              isTweaksOpen
                ? "bg-[#D96B43] text-white"
                : "bg-[#27272A] hover:bg-[#3F3F46] text-[#F4F4F5] border border-[#3F3F46]"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Tweaks</span>
          </button>
        </div>

        {/* Mini Tweaks Prompt Dialog Modal */}
        <AnimatePresence>
          {showTweaksPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="absolute top-18 right-8 z-30 w-[380px] bg-[#18181B] border border-[#3F3F46] rounded-xl p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-[#F4F4F5]">
                  Request UI Tweaks
                </span>
                <button
                  onClick={() => setShowTweaksPrompt(false)}
                  className="text-[#A1A1AA] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full h-20 bg-[#27272A] border border-[#3F3F46] rounded-lg p-2.5 text-[13px] text-white focus:outline-none focus:border-[#D96B43] resize-none"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setShowTweaksPrompt(false)}
                  className="px-3 py-1 text-[12px] text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyTweaksPrompt}
                  className="px-3.5 py-1 bg-[#D96B43] text-white text-[12px] font-medium rounded-lg hover:bg-[#c2410c] transition-colors cursor-pointer"
                >
                  Generate Controls
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Three.js R3F Canvas */}
        <Canvas camera={{ position: [0, 0, 5.8], fov: 45 }} className="w-full h-full cursor-grab active:cursor-grabbing">
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} />
          <CameraRig tweaks={tweaks} />
          <GlobeScene tweaks={tweaks} />
          <OrbitControls enablePan={false} minDistance={3.5} maxDistance={8.5} rotateSpeed={0.6} zoomSpeed={0.8} />
        </Canvas>
      </main>

      {/* 3. RIGHT: TWEAKS DRAWER PANEL */}
      <AnimatePresence>
        {isTweaksOpen && (
          <motion.aside
            key="tweaks-drawer"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.35, ease: TOKENS.easeSpring }}
            className="w-[320px] h-full bg-[#27272A] border-l border-[#3F3F46] p-5 overflow-y-auto flex flex-col gap-6 z-20 shrink-0 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#3F3F46]">
              <span className="font-medium text-[15px] text-[#F4F4F5]">Tweaks</span>
              <button
                onClick={() => setIsTweaksOpen(false)}
                className="text-[#A1A1AA] hover:text-[#F4F4F5] p-1 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Appearance */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Appearance</span>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#E4E4E7]">Theme</span>
                <div className="flex bg-[#18181B] p-0.5 rounded-lg border border-[#3F3F46]">
                  <button onClick={() => setTweaks((t) => ({ ...t, theme: "dark" }))} className={`px-2.5 py-1 text-[12px] font-medium rounded-md ${tweaks.theme === "dark" ? "bg-[#27272A] text-white" : "text-[#A1A1AA]"}`}>Dark</button>
                  <button onClick={() => setTweaks((t) => ({ ...t, theme: "light" }))} className={`px-2.5 py-1 text-[12px] font-medium rounded-md ${tweaks.theme === "light" ? "bg-[#27272A] text-white" : "text-[#A1A1AA]"}`}>Light</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#E4E4E7]">Breakpoint</span>
                <div className="flex bg-[#18181B] p-0.5 rounded-lg border border-[#3F3F46]">
                  {(["desktop", "tablet", "mobile"] as const).map((bp) => (
                    <button key={bp} onClick={() => setTweaks((t) => ({ ...t, breakpoint: bp }))} className={`px-2 py-1 text-[11px] capitalize rounded-md ${tweaks.breakpoint === bp ? "bg-[#27272A] text-white font-medium" : "text-[#A1A1AA]"}`}>{bp}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Network */}
            <div className="flex flex-col gap-3.5">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Network</span>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]"><span className="text-[#E4E4E7]">Arc width</span><span className="font-mono text-[#A1A1AA]">{tweaks.arcWidth.toFixed(1)}</span></div>
                <input type="range" min="0.5" max="5.0" step="0.1" value={tweaks.arcWidth} onChange={(e) => setTweaks((t) => ({ ...t, arcWidth: parseFloat(e.target.value) }))} className="w-full accent-[#D96B43]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]"><span className="text-[#E4E4E7]">Arc glow</span><span className="font-mono text-[#A1A1AA]">{tweaks.arcGlow}%</span></div>
                <input type="range" min="0" max="100" step="1" value={tweaks.arcGlow} onChange={(e) => setTweaks((t) => ({ ...t, arcGlow: parseInt(e.target.value, 10) }))} className="w-full accent-[#D96B43]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]"><span className="text-[#E4E4E7]">City size</span><span className="font-mono text-[#A1A1AA]">{tweaks.citySize}</span></div>
                <input type="range" min="1" max="10" step="1" value={tweaks.citySize} onChange={(e) => setTweaks((t) => ({ ...t, citySize: parseInt(e.target.value, 10) }))} className="w-full accent-[#D96B43]" />
              </div>
            </div>

            {/* Globe */}
            <div className="flex flex-col gap-3.5">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Globe</span>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]"><span className="text-[#E4E4E7]">Grid opacity</span><span className="font-mono text-[#A1A1AA]">{tweaks.gridOpacity.toFixed(2)}</span></div>
                <input type="range" min="0.0" max="1.0" step="0.05" value={tweaks.gridOpacity} onChange={(e) => setTweaks((t) => ({ ...t, gridOpacity: parseFloat(e.target.value) }))} className="w-full accent-[#D96B43]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]"><span className="text-[#E4E4E7]">Rotation speed</span><span className="font-mono text-[#A1A1AA]">{tweaks.rotationSpeed}</span></div>
                <input type="range" min="0" max="10" step="1" value={tweaks.rotationSpeed} onChange={(e) => setTweaks((t) => ({ ...t, rotationSpeed: parseInt(e.target.value, 10) }))} className="w-full accent-[#D96B43]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]"><span className="text-[#E4E4E7]">Tilt</span><span className="font-mono text-[#A1A1AA]">{tweaks.tilt}°</span></div>
                <input type="range" min="-45" max="45" step="1" value={tweaks.tilt} onChange={(e) => setTweaks((t) => ({ ...t, tilt: parseInt(e.target.value, 10) }))} className="w-full accent-[#D96B43]" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};
