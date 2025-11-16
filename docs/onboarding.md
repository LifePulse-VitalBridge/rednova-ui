# Onboarding Guide

Welcome to the project! This document provides step‑by‑step instructions to help new contributors set up their environment and begin working effectively.

---

## 1. Prerequisites

Before you start, ensure the following tools are installed on your system:

- **Node.js** (v18+ recommended) → [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local instance or cloud service like MongoDB Atlas) → [Setup guide](https://www.mongodb.com/docs/manual/installation/)
- **Git** → [Download here](https://git-scm.com/)
- **React** (installed via npm/yarn in the project)
- **Tailwind CSS** (configured within the React frontend)

---

## 2. Repository Setup

Follow these steps to get started with the repository:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
2. **Check available branches**

   ```bash
   git branch -a
3. **Switch to your feature branch**

   ```bash
   git checkout feature/<your-name>
   git pull origin feature/<your-name>
4. **Make changes and commit**

   ```bash
   git add .
   git commit -m "feat: short description of changes"
5. **Push changes to remote**

   ```bash
   git push origin feature/<your-name>
6. **Create a Pull Request (PR)**

Open a PR from your feature branch → dev branch.

Ensure CI/CD checks pass.

Request review from maintainers : In the right sidebar, add reviewers by GitHub username.
