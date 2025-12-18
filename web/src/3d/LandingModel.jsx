import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Html, Environment, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import {useNavigate} from "react-router-dom";

/* ------------------------------------------------ LIGHTS ------------------------------------------------ */

function Lights() {
  const pulseRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 0.5 + Math.sin(t * 2.0) * 0.3;
    if (pulseRef.current) {
      pulseRef.current.intensity = 1.6 + pulse * 1.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <spotLight
        intensity={2.7}
        angle={0.5}
        penumbra={0.7}
        position={[7, 10, 9]}
        castShadow
      />
      <pointLight ref={pulseRef} position={[3.2, 0.4, 0]} distance={8} color="#ff315f" />
      <pointLight position={[7, 2, 4]} distance={9} color="#46c8ff" />
    </>
  );
}

/* -------------------------------------------- REALISTIC HEART (ADJUSTED SIZE & BEAT) ----------------------------------------------- */

function RealisticHeart() {
  const group = useRef();

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    
    shape.moveTo(x, y + 0.3);
    // These curves create the "Plump" Emoji shape
    shape.bezierCurveTo(x - 1.6, y + 1.5, x - 3.2, y + 0.0, x, y - 2.2); // Left
    shape.bezierCurveTo(x + 3.2, y + 0.0, x + 1.6, y + 1.5, x, y + 0.3); // Right
    
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.1,              // Keep depth 0 for the "Puffed" look
    bevelEnabled: true,
    bevelSegments: 64,     // Ultra smooth
    steps: 1,
    bevelSize: 1.1,        // Width of the puff
    bevelThickness: 1.1,   // Forward/Back puffiness
    curveSegments: 64,
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!group.current) return;

    // Gentle Float
    group.current.position.y = 0.3 + Math.sin(t * 1) * 0.1;
    
    // Rotation (Spins around Y axis)
    group.current.rotation.y = t * 0.3;
    
    // ❤️ HEARTBEAT ANIMATION (STRONGER NOW)
    // Increased multiplier from 0.03 to 0.12 for a much more visible "ingrowing" beat
    const beat = 1 + Math.sin(t * 3.5) * 0.01; 
    group.current.scale.set(beat, beat, beat);
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
      {/* SCALE REDUCED: Changed from 0.55 to 0.45 
         POSITION: [4.3, 0.5, 0] matches the HUD layout
      */}
      <group ref={group} position={[4.3, 0.5, 0]} scale={0.20}>
        <mesh rotation={[0, 0, 0]} castShadow receiveShadow>
          <extrudeGeometry args={[heartShape, extrudeSettings]} />
          
          {/* MATERIAL: Deep Glossy Red */}
          <meshPhysicalMaterial
            color="#ff0022"       
            emissive="#550000"    
            emissiveIntensity={0.3}
            roughness={0.1}       
            metalness={0.1}       
            clearcoat={1.0}       
            clearcoatRoughness={0.0}
            reflectivity={1}
            ior={1.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ------------------------------------------ SOFT ORBITING DUST (UPGRADED) ------------------------------------------ */

function HeartDust() {
  const count = 1000; // ⭐ MORE PARTICLES

  const pointsRef = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.7 + Math.random() * 0.75;

      arr[i * 3] = Math.cos(angle) * radius + 4.3;
      arr[i * 3 + 1] = 0.15 + (Math.random() - 0.5) * 0.4;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pts = pointsRef.current;
    if (!pts) return;

    const arr = pts.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const angle = t * 0.6 + i * 0.15;
      const baseRadius = 2.8 + (i % 9) * 0.04;

      arr[i * 3] = Math.cos(angle) * baseRadius + 4.3;
      arr[i * 3 + 2] = Math.sin(angle) * baseRadius;
      arr[i * 3 + 1] = 0.25 + Math.sin(t * 1.7 + i) * 0.1;
    }

    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} count={count} />
      </bufferGeometry>

      <pointsMaterial
        size={0.12}
        color="#ff7fa7"
        opacity={0.95}
        transparent
        sizeAttenuation
      />
    </points>
  );
}

/* ------------------------------------------- ORBIT RING --------------------------------------------- */

function OrbitRing() {
  return (
    <group position={[4.3, -0.1, 0]} rotation-x={-Math.PI / 2}>
      <mesh>
        <circleGeometry args={[3.3, 64]} />
        <meshStandardMaterial
          color="#3b0813"
          emissive="#ff1d3f"
          emissiveIntensity={0.25}
          roughness={0.85}
        />
      </mesh>

      <mesh>
        <ringGeometry args={[2.8, 3.3, 90]} />
        <meshStandardMaterial
          color="#ff345f"
          emissive="#ff345f"
          emissiveIntensity={0.85}
          roughness={0.4}
          metalness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------- HOLOGRAM FLOOR ------------------------------------------ */

function HologramFloor() {
  return (
    <group position={[4.3, -1.1, 0]}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[3.6, 64]} />
        <meshStandardMaterial
          color="#050814"
          emissive="#ff1d3f"
          emissiveIntensity={0.25}
          roughness={0.88}
        />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial
          color="#120712"
          emissive="#ff375f"
          emissiveIntensity={0.5}
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}

/* ----------------------------------- BACKGROUND PARTICLES (UPGRADED) ----------------------------------- */

function Particles() {
  return (
    <>
      <Sparkles
        count={1500}    // MORE
        speed={0.9}    // FASTER
        opacity={0.33}
        size={15}
        scale={[55, 40, 48]}
        color="#ff7b95"
      />

      <Sparkles
        count={1500}    // MORE
        speed={0.7}    // FASTER
        opacity={0.27}
        size={11}
        scale={[55, 40, 48]}
        color="#4fd1ff"
      />

      <Sparkles
        count={1500}    // MORE
        speed={0.55}   // FASTER
        opacity={0.2}
        size={8}
        scale={[60, 42, 50]}
        color="#ff2044"
      />
    </>
  );
}

/* ----------------------------------------------- UI HUD (UPGRADED) ----------------------------------------------- */

function HUD({ welcomeFlash, onConnect }) {
  return (
    <Html fullscreen>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1.8rem 3rem",
          pointerEvents: "none",
          fontFamily: "system-ui, Inter, sans-serif",
        }}
      >
        {/* -------- UPGRADED WELCOME CARD -------- */}
        {welcomeFlash && (
          <div
            style={{
              position: "absolute",
              top: "1.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
              filter: "drop-shadow(0 0 35px rgba(255,68,122,0.7))",
            }}
          >
            <div
              style={{
                padding: "1rem 3rem",
                borderRadius: "999px",
                background:
                  "linear-gradient(120deg, rgba(79,70,229,0.95), rgba(236,72,153,0.95), rgba(249,115,22,0.95))",
                color: "white",
                fontSize: "1.05rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                boxShadow:
                  "0 0 38px rgba(236,72,153,0.9), 0 0 62px rgba(79,70,229,0.8)",
                border: "1px solid rgba(255,255,255,0.35)",
                whiteSpace: "nowrap",
                backdropFilter: "blur(8px)",
              }}
            >
              WELCOME TO REDNOVA
            </div>
          </div>
        )}

        {/* ------------ LOGO (unchanged) ----------- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: "2.6rem",
              height: "2.6rem",
              borderRadius: "999px",
              background:
                "conic-gradient(from 210deg, #ff7b95, #ff2044, #3fb7ff, #ff7b95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 18px rgba(248, 113, 113, 0.7)",
            }}
          >
            <div
              style={{
                width: "1.6rem",
                height: "1.6rem",
                borderRadius: "999px",
                background: "#0b1120",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f9fafb",
                fontWeight: 800,
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
              }}
            >
              RN
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#e5e7eb",
              }}
            >
              REDNOVA
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.26em",
                color: "#9ca3af",
                marginTop: "0.08rem",
              }}
            >
              Blood Network
            </div>
          </div>
        </div>

        {/* -------- LEFT TEXT (UPGRADED STYLING + MOTION EFFECT) -------- */}
        <div style={{ maxWidth: "38rem", marginTop: "2.6rem" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "3rem",
              color: "white",
              lineHeight: 1.15,
              background:
                "linear-gradient(90deg, #fff, #ff5f8e, #fff, #4fd1ff)",
              backgroundSize: "400% 100%",
              WebkitBackgroundClip: "text",
              //color: "transparent",
              animation: "shineMove 6s linear infinite",
            }}
          >
            REDNOVA connects{" "}
            <span style={{ color: "#ff315f" }}>donors and banks</span> with{" "}
            <span style={{ color: "#4fd1ff" }}>hospitals</span> in a real-time,
            intelligent blood network.
          </h1>

          <p
            style={{
              marginTop: "1rem",
              color: "#c9cad1",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              letterSpacing: "0.015em",
              borderLeft: "3px solid #ff315f",
              paddingLeft: "1rem",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,0,0,0.06))",
              animation: "slowPulse 5s ease-in-out infinite",
            }}
          >
            Monitor blood availability, discover nearby donors, and handle
            emergencies in seconds — powered by geo-aware, live medical data so
            no one waits when it matters most.
          </p>
        </div>

        {/* BUTTON unchanged */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: "2.2rem",
            pointerEvents: "auto",
          }}
        >
          <button
  style={{
    position: "relative",
    padding: "1rem 3.5rem",
    borderRadius: "100px",
    border: "none",
    
    /* 🌈 THE ULTIMATE MIX: Green -> Blue -> Indigo -> Purple */
    background: "linear-gradient(300deg, #00F260, #0575E6, #8E2DE2, #b224ef)",
    backgroundSize: "300% 300%",
    animation: "auroraFlow 6s ease infinite", /* Smooth, constant color shifting */
    
    color: "white",
    fontSize: "1rem",
    fontWeight: "900",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    cursor: "pointer",
    
    /* 💎 CRYSTAL GLOW & SHADOWS */
    boxShadow: `
      inset 0 2px 4px rgba(255, 255, 255, 0.5),   /* Top Glass Glint */
      inset 0 -4px 6px rgba(0, 0, 0, 0.2),        /* Inner Depth */
      0 0 0 2px rgba(255, 255, 255, 0.1),         /* Subtle Ring */
      0 10px 40px rgba(5, 117, 230, 0.6)          /* Beautiful Blue/Purple Glow */
    `,
    
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
    transform: "translateY(0px) scale(1)",
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    zIndex: 10,
    overflow: "hidden"
  }}
  onMouseEnter={(e) => {
    // HOVER: Lifts up, glows brighter cyan/blue
    e.currentTarget.style.transform = "translateY(-5px) scale(1.05)";
    e.currentTarget.style.boxShadow = `
      inset 0 2px 4px rgba(255, 255, 255, 0.8),
      inset 0 -4px 6px rgba(0, 0, 0, 0.2),
      0 0 0 3px rgba(255, 255, 255, 0.4),
      0 20px 60px rgba(0, 242, 96, 0.6) /* Neon Green/Blue Glow */
    `;
    e.currentTarget.style.animationDuration = "2s"; // Colors move fast on hover!
  }}
  onMouseLeave={(e) => {
    // RESET
    e.currentTarget.style.transform = "translateY(0px) scale(1)";
    e.currentTarget.style.boxShadow = `
      inset 0 2px 4px rgba(255, 255, 255, 0.5),
      inset 0 -4px 6px rgba(0, 0, 0, 0.2),
      0 0 0 2px rgba(255, 255, 255, 0.1),
      0 10px 40px rgba(5, 117, 230, 0.6)
    `;
    e.currentTarget.style.animationDuration = "6s";
  }}
  onMouseDown={(e) => {
    // CLICK: Physical Press
    e.currentTarget.style.transform = "translateY(2px) scale(0.95)";
    e.currentTarget.style.filter = "brightness(0.9)"; // Slight darkening
  }}
  onMouseUp={(e) => {
    e.currentTarget.style.transform = "translateY(-5px) scale(1.05)";
    e.currentTarget.style.filter = "brightness(1)";
  }}
  onClick={onConnect}
>
  <span style={{ position: 'relative', zIndex: 10 }}>
    CONNECT REDNOVA
  </span>
  
  {/* Glossy Reflection Overlay */}
  <div style={{
    position: "absolute",
    top: 0, left: 0, width: "100%", height: "50%",
    background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
    borderRadius: "100px 100px 0 0",
    pointerEvents: "none"
  }} />
</button>

        </div>
      </div>

      {/* small CSS animation injection */}
      <style>{`
@keyframes shineMove {
  0% { background-position: 0% 0%; }
  100% { background-position: 400% 0%; }
}
@keyframes auroraFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes slowPulse {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}
      `}</style>
    </Html>
  );
}

/* ---------------------------------------------- POST FX ----------------------------------------------- */

function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.15}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.25}
      />
      <Vignette eskil={false} offset={0.23} darkness={0.88} />
    </EffectComposer>
  );
}

/* ------------------------------------------------ EXPERIENCE ------------------------------------------- */

export default function Experience() {
  const navigate = useNavigate();
  const sceneRef = useRef();
  const { gl } = useThree();
  const drag = useRef({ active: false, x: 0, y: 0 });
  const [welcomeFlash, setWelcomeFlash] = useState(false);

  const handleConnect = () => {
    // Trigger the UI Flash
    setWelcomeFlash(true);

    // Wait 2 seconds for the animation to play, then navigate
    setTimeout(() => {
      navigate("/auth");
    }, 2000); 
    // setWelcomeFlash(false);
  };
  // DRAG rotation logic (unchanged)
  useEffect(() => {
    const dom = gl.domElement;

    const down = (e) => {
      drag.current.active = true;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
    };
    const up = () => {
      drag.current.active = false;
    };
    const move = (e) => {
      if (!drag.current.active || !sceneRef.current) return;

      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;

      drag.current.x = e.clientX;
      drag.current.y = e.clientY;

      sceneRef.current.rotation.y += dx * 0.0035;
      sceneRef.current.rotation.x = THREE.MathUtils.clamp(
        sceneRef.current.rotation.x + dy * 0.0035,
        -0.25,
        0.25
      );
    };

    dom.addEventListener("pointerdown", down);
    dom.addEventListener("pointerup", up);
    dom.addEventListener("pointerleave", up);
    dom.addEventListener("pointermove", move);

    return () => {
      dom.removeEventListener("pointerdown", down);
      dom.removeEventListener("pointerup", up);
      dom.removeEventListener("pointerleave", up);
      dom.removeEventListener("pointermove", move);
    };
  }, [gl]);

 
 // };

  return (
    <>
      <color attach="background" args={["#04060b"]} />
      <Environment preset="city" />

      <Particles />

      <group ref={sceneRef}>
        <Lights />
        <HologramFloor />
        <OrbitRing />
        <RealisticHeart />
        <HeartDust /> {/* UPGRADED DUST */}
      </group>

      <HUD welcomeFlash={welcomeFlash} onConnect={handleConnect} />
      <Effects />
    </>
  );
}
