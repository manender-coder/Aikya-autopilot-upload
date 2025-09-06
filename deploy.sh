#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

echo "♾️ Autopilot: adding/committing/pushing to origin/main..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/manender-coder/aikya-autopilot-upload.git
git branch -M main

git add .
git commit -m "chore: trigger autopilot $(date -Iseconds)" || echo "No changes to commit"
git push origin main --force

echo "Triggering Actions workflow..."
gh workflow run "play-autopilot.yml" --repo manender-coder/aikya-autopilot-upload

RUN_ID=$(gh run list --workflow="play-autopilot.yml" --limit 1 --json databaseId --jq '.[0].databaseId' --repo manender-coder/aikya-autopilot-upload)
echo "Watching run: $RUN_ID"
gh run watch "$RUN_ID" --repo manender-coder/aikya-autopilot-upload
