import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm"; // Helper for random positions

const StarField = (props) => {
  const ref = useRef();
  
  // Generate 5000 random points inside a sphere
  const sphere = useMemo(() => random.inSphere(new Float32Array(7000 * 4), { radius: 1.2 }), []);

  useFrame((state, delta) => {
    // Rotate the entire star sphere slowly to create the "moving through space" effect
    ref.current.rotation.x -= delta / 25;
    ref.current.rotation.y -= delta / 35;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#f272c8" // Base tint (overridden by vertex colors usually, but good fallback)
          size={0.0025}    // Size of the stars
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const ProfileBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-black">
      {/* bg-black ensures the void is dark.
        z-[-1] puts it behind all your content.
      */}
      <Canvas camera={{ position: [0, 0, 1] }}>
        {/* We create two layers of stars with different colors 
            to create that "Different" look you asked for.
        */}
        
        {/* Layer 1: Cool Blues and Cyans (The "Data" Vibe) */}
        <StarField color="#00d8ff" /> 
        <StarField color=" #ff4dff" />

        {/* Layer 2: Deep Purples (To keep the REDNOVA branding link) */}
        <Points positions={useMemo(() => random.inSphere(new Float32Array(2000 * 3), { radius: 1.5 }), [])} stride={3}>
           <PointMaterial transparent color="#8b5cf6" size={0.005} sizeAttenuation={true} depthWrite={false} />
        </Points>
        
        {/* Layer 3: Bright White distant stars */}
        <Points positions={useMemo(() => random.inSphere(new Float32Array(1000 * 3), { radius: 2 }), [])} stride={3}>
           <PointMaterial transparent color="#ffffff" size={0.0030} sizeAttenuation={true} depthWrite={false} />
        </Points>
      </Canvas>
    </div>
  );
};

export default ProfileBackground;