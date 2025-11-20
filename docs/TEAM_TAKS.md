# Team Workflow & AI Prompts

This document outlines the standard prompts to use when generating 3D assets and the daily tasks for the team.

## 🤖 AI Prompt for 3D Models
### Copy from here and paste it there ###
```
When using Gemini or ChatGPT to generate new 3D components, copy and paste the following **two-part prompt** to ensure the code fits our architecture.

### Part 1: Project Context
> I am working on a React project called "REDNOVA" (a blood donation website).
> I need you to generate a new 3D component for me.
>
> **Here is my Project Context (Do not change this):**
> 1. **Tech Stack:** Vite + React
> 2. **3D Libraries:** Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing
> Aim of the creation - It is a website where i will use this 3d model and its aim is :
Our Aim is modernizing the facility of donating blood and finding donors as soon as possible so that no one suffers in the case of urgency. For the same, we want to develop an  that will contain the real time database of all the blood banks in your locality stating the units of blood available with its characteristics, real time requisition for blood by individuals. The user can track the nearby hospitals/blood banks and even the events being conducted by them with the help of geo-tracking.
<img width="1391" height="125" alt="image" src="https://github.com/user-attachments/assets/cafdb3c7-90e5-4ef6-96a7-4cbe0b89e773" />

>

### Part 2: Integration Check


> I have these existing files. Please check if I need to make any changes to them to support the new component, or if I can just import it directly.
>
> **My App.jsx:**
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
> **My index.css:**
* {
  box-sizing: border-box;
}

body, html, #root, #canvas-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #050505;
}
---
Last thing i will always paste your code inside the Experience.jsx file.
```

## 📋 Daily Instructions

**Goal:** Create at least **1 model** today.

**Tools:**
- Use **Gemini** or **ChatGPT** with the prompts above.
- Save your new component in `web/src/components/canvas/`.
- Import the code into `Experience.jsx` to test it.

## 📂 Storage & Structure Guidelines

**Strictly follow these paths to keep the project organized:**

### 1. Where to store 3D Models (Assets)
* **Path:** `web/public/models/`
* **File Types:** `.glb`, `.gltf`
* **Rule:** These are heavy binary files. Never put them inside the `src` folder.

### 2. Where to store 3D Logic (Code)
* **Path:** `web/src/components/canvas/`
* **File Types:** `.jsx` (React Components)
* **Rule:** This is where you write the **Code**.
    * **`Experience.jsx`**: This file contains **LOGIC only** (Lighting, Camera, Animations). It is *not* the model itself. It *loads* the model from the public folder.
    * **New Components:** If you build a `Heart.jsx`, put it here.
