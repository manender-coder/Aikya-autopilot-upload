#!/data/data/com.termux/files/usr/bin/bash
echo "♾️ Starting Full Autopilot Deploy..."

# Disable Hermes for Termux
sed -i 's/enabled: true/enabled: false/' android/app/build.gradle || echo "No Hermes to disable"

# 1️⃣ Build Android AAB using EAS
echo "🏗️ Building AAB..."
eas build -p android --profile production --non-interactive

# 2️⃣ Deploy Firebase hosting, firestore, storage
echo "📦 Deploying Firebase..."
firebase deploy --only hosting,firestore,storage --project YOUR_FIREBASE_PROJECT_ID

# 3️⃣ Find latest .aab
LATEST_AAB=$(find ./build/android -name "*.aab" -type f | sort | tail -n 1)
if [ -z "$LATEST_AAB" ]; then
  echo "❌ No AAB found! Exiting..."
  exit 1
fi
echo "📦 Found AAB: $LATEST_AAB"

# 4️⃣ Upload to Google Play using Fastlane
echo "🚀 Uploading AAB to Play Store..."
fastlane supply --aab "$LATEST_AAB" \
  --track production \
  --package_name YOUR_ANDROID_PACKAGE_NAME \
  --json_key service-account.json \
  --skip_upload_metadata true \
  --skip_upload_images true \
  --skip_upload_screenshots true

echo "✅ Full Autopilot Deploy Completed!"
