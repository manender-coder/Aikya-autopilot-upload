#!/bin/bash

# Step 0: Navigate to project directory (optional if already in it)
cd ~/myApp || exit

# Step 1: Set environment variables for Termux
export EAS_SKIP_AUTO_FINGERPRINT=1
export EAS_BUILD_CONCURRENCY=1
export PYTHON=python3

# Step 2: Increment versionCode automatically
# Optional: you can use EAS CLI for this
eas build:configure --platform android

# Step 3: Build the app
eas build -p android --profile production

# Step 4: Output the download link
echo "Your build download link will be in the EAS build logs above."

echo "✅ Done! You can share the .aab for Internal Testing."
