# Daily Development Workflow

This guide covers the standard process for contributing code to the repository using Git and GitHub CLI (`gh`).

## 1. Start of Day: Get Latest Code
*Run this before starting work to ensure your branch has the latest team updates.*

```bash
# 1. Switch to your branch (if not already there)
git checkout feature/your-branch-name

# 2. Update your branch directly from the remote Dev branch
git fetch origin
git merge origin/dev

## End of Day: Save, Sync & Submit
*Run this sequence when you are finished with your task and ready to create a Pull Request.*

```bash
# 1. Save your local changes first
git add .
git commit -m "Brief description of work done"

# 2. Pull the latest team code into your branch
# (This ensures your code fits with what the team has done today)
git fetch origin
git merge origin/dev

# NOTE: If the terminal says "CONFLICT", open the files in VS Code, 
# choose the correct code, save, and run 'git add .' and 'git commit' again.

# 3. Push your code to the server
git push origin feature/your-branch-name

# 4. Create the Pull Request (PR) to 'dev'
# --web opens the browser so you can write the description comfortably
gh pr create --base dev --head feature/your-branch-name --web
