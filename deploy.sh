#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "♾️ Starting Aikya Autopilot Deploy..."

# 1. Remote reset
git remote remove origin 2>/dev/null || true
git remote add origin https://manender-coder:${GITHUB_PAT}@github.com/manender-coder/aikya-autopilot-upload.git
git branch -M main

# 2. Commit & Push
git add .
git commit -m "♾️ Autopilot Deploy Trigger" || echo "No changes to commit"
git push -u origin main --force

# 3. Trigger Workflow
echo "⚡ Triggering GitHub Actions workflow..."
gh workflow run "Aikya Autopilot Build & Deploy" --repo manender-coder/aikya-autopilot-upload

# 4. Attach to live logs
LATEST_RUN=$(gh run list --workflow="Aikya Autopilot Build & Deploy" --limit 1 --json databaseId --jq '.[0].databaseId' --repo manender-coder/aikya-autopilot-upload)
echo "📍 Watching live logs for run ID: $LATEST_RUN"
gh run watch $LATEST_RUN --repo manender-coder/aikya-autopilot-upload
