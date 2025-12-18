import Experience from "../3d/LandingModel";

import { Canvas } from "@react-three/fiber";

export default function LandingPage() {
  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        camera={{ position: [0, 0, 18], fov: 35 }}
        dpr={[1, 2]}
      >
        <Experience />

      </Canvas>
    </div>
  );
}
