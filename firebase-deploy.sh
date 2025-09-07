#!/bin/bash
# 🔹 Aikya Autopilot Firebase CI/CD Deployment
# 🔹 Deploys Firestore rules, Storage rules, DataConnect, and registers App Check
# 🔹 Make sure firebase-tools CLI is installed and you are logged in

set -e  # Exit on error

PROJECT_ID="aikya-autopilot"
ANDROID_APP_ID="com.aikya.spritual.platform"

echo "🚀 Starting Firebase deployment for project: $PROJECT_ID"

# -----------------------------
# 1️⃣ Firestore Rules Deployment
# -----------------------------
echo "📄 Deploying Firestore rules..."
if [ ! -f firestore.rules ]; then
  echo "rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}" > firestore.rules
fi

firebase deploy --only firestore:rules --project "$PROJECT_ID"

# -----------------------------
# 2️⃣ Storage Rules Deployment
# -----------------------------
echo "📦 Deploying Storage rules..."
if [ ! -f storage.rules ]; then
  echo "rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}" > storage.rules
fi

firebase deploy --only storage --project "$PROJECT_ID"

# -----------------------------
# 3️⃣ DataConnect Deployment
# -----------------------------
echo "🗄️ Deploying DataConnect..."
# Ensure firebase.json has source for DataConnect
if ! grep -q '"dataconnect"' firebase.json; then
  jq '. + {dataconnect: {source: "dataconnect/schema/schema.gql"}}' firebase.json > firebase.tmp.json
  mv firebase.tmp.json firebase.json
fi

firebase deploy --only dataconnect --project "$PROJECT_ID"

# -----------------------------
# 4️⃣ App Check Registration
# -----------------------------
echo "🔒 Registering App Check for Android..."
firebase appcheck:android register "$ANDROID_APP_ID" \
  --project "$PROJECT_ID" \
  --provider=play-integrity || echo "⚠️ App Check may already be registered."

echo "✅ All deployments completed successfully!"
echo "Project Console: https://console.firebase.google.com/project/$PROJECT_ID/overview"
