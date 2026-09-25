import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "@phosphor-icons/react";

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
              viewBox="0 0 256 257"
              fill="currentColor"
            >
              <path d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z" />
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
