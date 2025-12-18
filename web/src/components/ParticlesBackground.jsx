import React from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import ShootingStars from "./ShootingStars";

const ParticlesBackground = () => {
  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      zIndex: 0, 
      // Deep Space Gradient
      background: "radial-gradient(circle at 50% 50%, #1a0b10 0%, #000000 100%)", 
      pointerEvents: "none" 
    }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        
        {/* 1. BRAND RED - Large & Slow */}
        <Sparkles 
          count={1000} scale={[20, 20, 10]} size={6} 
          speed={0.4} opacity={0.8} color="#ff0f3e" 
        />

        {/* 2. CYAN BLUE - Floating drift */}
        <Sparkles 
          count={1000} scale={[25, 25, 15]} size={4} 
          speed={0.4} opacity={0.6} color="#00f3ff" 
        />

        {/* 3. COSMIC PURPLE */}
        <Sparkles 
          count={800} scale={[30, 30, 20]} size={5} 
          speed={0.2} opacity={0.5} color="#bf00ff" 
        />

        {/* 4. GOLD HIGHLIGHTS */}
        <Sparkles 
          count={400} scale={[15, 15, 10]} size={7} 
          speed={0.5} opacity={0.9} color="#fffc00" 
        />

        {/* 5. WHITE STARS - Background Depth */}
        <Sparkles 
          count={1000} scale={[40, 40, 40]} size={1.5} 
          speed={0.3} opacity={0.3} color="#ffffff" 
        />

        {/* 6. TEAL - Subtle Accent */}
        <Sparkles 
          count={600} scale={[22, 22, 10]} size={3} 
          speed={0.3} opacity={0.6} color="#00ff9d" 
        />

        {/* 7. HOT PINK */}
        <Sparkles 
          count={600} scale={[28, 28, 15]} size={4} 
          speed={0.4} opacity={0.7} color="#ff0080" 
        />

        {/* 8. ORANGE ENERGY */}
        <Sparkles 
          count={500} scale={[18, 18, 10]} size={5} 
          speed={0.6} opacity={0.8} color="#ff8800" 
        />

        {/* 9. DEEP INDIGO */}
        <Sparkles 
          count={700} scale={[35, 35, 20]} size={4} 
          speed={0.4} opacity={0.5} color="#4b0082" 
        />
        {/* Shooting Stars Layer */}
        <ShootingStars />
      </Canvas>
    </div>
  );
};

export default ParticlesBackground;