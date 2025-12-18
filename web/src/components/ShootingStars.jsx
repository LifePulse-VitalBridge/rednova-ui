import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

// 🎨 AURORA COLOR PALETTE
const AURORA_COLORS = [
  "#0A1A2F", // Premium Dark Blue (base depth)
  "#4D4DFF", // Electric Indigo (kept from your set)
  "#8A2BE2", // Deep Violet (kept, works great)
  "#C724FF", // Aurora Purple (better transition to magenta)
  "#FF4FD8", // Aurora Pink (more glow, less harsh than #FF00FF)
  "#00F5C8"  // Soft Aurora Teal (smoother & more premium than #00FF9D)
];

// ⚙️ CONFIGURATION
const SPAWN_INTERVAL = 1.0;  // Exact 1 star per second
const FALL_DURATION = 10.0;  // Takes 10 seconds to cross the screen
const START_Y = 15;          // Start Top
const END_Y = -15;           // End Bottom
const X_TRAVEL = 20;         // How far Right it moves (Diagonal slope)
const START_X_RANGE = 40;    // How wide the starting area is

const FallingSparkle = ({ offsetIndex }) => {
  const ref = useRef();
  
  // Assign a stable random Start X and Color
  const [randomProps] = useState(() => ({
    // Start slightly more to the left (-25 to 15) so they fall INTO the screen
    startX: (Math.random() - 0.6) * START_X_RANGE,
    color: AURORA_COLORS[Math.floor(Math.random() * AURORA_COLORS.length)]
  }));

  useFrame((state) => 
    {
     const t = state.clock.getElapsedTime();
    
     // 🧠 THE MATH: Calculate Exact Position based on Time
     const timeOffset = t + (offsetIndex * SPAWN_INTERVAL);
    
     // "progress" goes from 0.0 to 1.0
     const progress = (timeOffset % FALL_DURATION) / FALL_DURATION;

     // 1. Vertical Move (Top -> Bottom)
     const currentY = START_Y - (progress * (START_Y - END_Y));
    
     // 2. Horizontal Move (Left -> Right) = DIAGONAL
     // We take the startX and add the travel distance based on progress
     const currentX = randomProps.startX + (progress * X_TRAVEL);

     if (ref.current) {
      ref.current.position.set(currentX, currentY, 0);
     }
    });

  return (
    <group ref={ref}>
      <Sparkles
        count={1}
        scale={[1, 1, 1]}
        size={60}         
        speed={0}         
        opacity={2}       
        noise={0}
        color={randomProps.color}
      />
    </group>
  );
};

const ShootingStars = () => {
  // Calculate exact number of stars needed to fill the loop
  const starCount = Math.ceil(FALL_DURATION / SPAWN_INTERVAL);
  
  const stars = useMemo(() => new Array(starCount).fill(0).map((_, i) => i), [starCount]);

  return (
    <group>
      {stars.map((i) => (
        <FallingSparkle key={i} offsetIndex={i} />
      ))}
    </group>
  );
};

export default ShootingStars;