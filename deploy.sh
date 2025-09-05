#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "♾️ Starting Aikya Autopilot Deploy..."

# 1. Remote set
git remote remove origin 2>/dev/null || true
git remote add origin https://manender-coder:${GITHUB_PAT}@github.com/manender-coder/aikya-autopilot-upload.git
git branch -M main

# 2. Secrets update
gh secret set EXPO_TOKEN --body "$EXPO_TOKEN" --repo manender-coder/aikya-autopilot-upload
gh secret set PLAY_SERVICE_ACCOUNT_JSON --body "$(cat android/fastlane/play-service.json)" --repo manender-coder/aikya-autopilot-upload

# 3. Commit & Push
git add .
git commit -m "♾️ Autopilot Deploy Trigger" || echo "No changes to commit"
git push -u origin main --force

# 4. Trigger Workflow
gh workflow run play-autopilot.yml --repo manender-coder/aikya-autopilot-upload

echo "✅ Autopilot Deploy Finished! Check Actions tab on GitHub."
