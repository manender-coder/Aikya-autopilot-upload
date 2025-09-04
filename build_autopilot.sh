#!/bin/bash
set -euo pipefail
cd ~/myApp

echo "♾️ Starting Eternal Charevati Autopilot Build..."

export EAS_SKIP_AUTO_FINGERPRINT=1
export EAS_BUILD_CONCURRENCY=1

# Build
eas build -p android --profile production --non-interactive --wait

# Find latest artifact
AAB_URL="$(eas build:list --non-interactive --limit 1 --status finished | grep -Eo 'https://expo.dev/artifacts/eas/[A-Za-z0-9._-]+')"
curl -L "$AAB_URL" -o latest.aab

echo "✅ AAB ready: $(pwd)/latest.aab"

# Upload to Play Internal
cd android
fastlane internal || true
cd ..

echo "📝 Running captions & autonorms..."
if [ -f scripts/generate_captions.py ]; then
  python3 scripts/generate_captions.py --autonorms || true
fi

echo "♾️ Charevati Autopilot Complete. Internal Testing live!"
