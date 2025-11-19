# Team Workflow & AI Prompts

This document outlines the standard prompts to use when generating 3D assets and the daily tasks for the team.

## 🤖 AI Prompt for 3D Models

When using Gemini or ChatGPT to generate new 3D components, copy and paste the following **two-part prompt** to ensure the code fits our architecture.

### Part 1: Project Context
> I am working on a React project called "REDNOVA" (a blood donation website).
> I need you to generate a new 3D component for me.
>
> **Here is my Project Context (Do not change this):**
> 1. **Tech Stack:** Vite + React
> 2. **3D Libraries:** Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing
> 3. **Folder Structure:** My 3D components live in `web/src/components/canvas/`.
> 4. **Scene Setup:** I already have a main `App.jsx` that handles the `<Canvas>`, Lights, and Post-Processing.
>

### Part 2: Integration Check
*After the AI generates the component code, if you are unsure how it fits, paste your current configuration:*

> I have these existing files. Please check if I need to make any changes to them to support the new component, or if I can just import it directly.
>
> **My App.jsx:**

> **My index.css:**

---

## 📋 Daily Instructions

**Goal:** Create at least **1 model** today.

**Tools:**
- Use **Gemini** or **ChatGPT** with the prompts above.
- Save your new component in `web/src/components/canvas/`.
- Import the code into `Experience.jsx` to test it.
