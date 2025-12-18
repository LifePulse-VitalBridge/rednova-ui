import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

// A component to slowly rotate the entire starfield for a cinematic effect
const MovingStars = () => {
  const starsRef = useRef();
  useFrame((state) => {
    // Very slow rotation to make the universe feel "alive"
    starsRef.current.rotation.y += 0.0004; 
    starsRef.current.rotation.x += 0.0002;
  });

  return (
    <group ref={starsRef}>
      <Stars 
        radius={100} 
        depth={50} 
        count={8000} // High star count for that "deep space" look
        factor={5} 
        saturation={4} 
        fade 
        speed={1} 
      />
    </group>
  );
};

const CosmicBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-50 bg-black">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <MovingStars />
      </Canvas>
    </div>
  );
};

export default CosmicBackground;