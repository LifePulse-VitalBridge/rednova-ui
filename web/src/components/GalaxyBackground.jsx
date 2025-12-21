import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';

// ==========================================
// --- CONFIGURATION ---
// ==========================================
const CONFIG = {
  count: 50000,          // More particles to fill the empty space
  spread: 200,            // How wide the field is (Massive area)
  speed: 0.02,           // Drifting speed
  size: 0.20,            // Size of each particle
  colors: ['#ff6030', '#ff0000', '#a00030', '#ffb0a0', '#300000'], // RedNova Palette
};

// ==========================================
// --- NEBULA FIELD COMPONENT ---
// ==========================================
const NebulaField = () => {
  const pointsRef = useRef();

  // --- GENERATE PARTICLES EVERYWHERE ---
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(CONFIG.count * 3);
    const colors = new Float32Array(CONFIG.count * 3);
    
    const colorPalette = CONFIG.colors.map(c => new THREE.Color(c));

    for (let i = 0; i < CONFIG.count; i++) {
      // 1. Random Position in a massive box (Spread everywhere)
      // We use Math.pow to bias slightly towards center but keep edges full
      const x = (Math.random() - 0.5) * CONFIG.spread;
      const y = (Math.random() - 0.5) * CONFIG.spread * 0.6; // Flatter on Y axis
      const z = (Math.random() - 0.5) * CONFIG.spread;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 2. Assign Random Color from Palette
      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      
      // Mix slightly with white for variations in brightness
      const mixedColor = randomColor.clone().lerp(new THREE.Color('#ffffff'), Math.random() * 0.1);

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    return [positions, colors];
  }, []);

  // --- ANIMATION ---
  useFrame((state, delta) => {
    if (pointsRef.current) {
      // 1. Continuous Rotation (The whole universe spins slowly)
      pointsRef.current.rotation.y += delta * CONFIG.speed * 0.5;
      pointsRef.current.rotation.x += delta * CONFIG.speed * 0.1;

      // 2. Wave Motion (Makes it look like a fluid, not static dots)
      // We gently wobble the container
      const time = state.clock.elapsedTime;
      pointsRef.current.position.y = Math.sin(time * 0.2) * 0.5;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={CONFIG.size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending} // Makes them glow when overlapping
        opacity={0.8}
      />
    </Points>
  );
};

// ==========================================
// --- DISTANT STARS LAYER ---
// ==========================================
const BackgroundStars = () => {
  const ref = useRef();
  
  const [positions, colors] = useMemo(() => {
    const count = 3000; // Extra stars for depth
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    
    for(let i=0; i<count; i++) {
        // Push these far away to create a "background" layer
        const r = CONFIG.spread * 1.5 + Math.random() * 20; 
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i*3+2] = r * Math.cos(phi);

        const starCol = new THREE.Color('#ffffff');
        col[i*3] = starCol.r;
        col[i*3+1] = starCol.g;
        col[i*3+2] = starCol.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
      if(ref.current) ref.current.rotation.y -= delta * 0.005; // Move slower than foreground
  });

  return (
      <Points ref={ref} positions={positions} colors={colors} stride={3}>
          <PointMaterial size={0.1} sizeAttenuation transparent opacity={0.3} depthWrite={false} />
      </Points>
  )
}

// ==========================================
// --- MAIN COMPONENT ---
// ==========================================
const GalaxyBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black">
      {/* 1. Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10"></div>
      
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }} // Camera is further back to see more
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#020005']} />

        {/* 2. Scene Elements */}
        <NebulaField />
        <BackgroundStars />

        {/* 3. Controls (Slow drift) */}
        <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={false} 
            autoRotate 
            autoRotateSpeed={0.3} 
        />

        {/* 4. Post Processing (The Glow) */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.15} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.4}
          />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

      </Canvas>
    </div>
  );
};

export default GalaxyBackground;