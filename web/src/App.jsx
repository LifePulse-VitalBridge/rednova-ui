import { Canvas } from "@react-three/fiber";
import Experience from "./assets/components/canvas/Experience";

export default function App() {
  return (
    <div id="canvas-container">
      <Canvas
        shadows
        camera={{ position: [0, 0, 18], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: false }}
      >
        <Experience />
      </Canvas>
    </div>
  );
}