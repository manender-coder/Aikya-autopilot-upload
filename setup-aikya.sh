#!/data/data/com.termux/files/usr/bin/bash

echo "⚡ Starting Aikya autopilot setup..."

# --- 1. Update Termux packages ---
pkg update -y && pkg upgrade -y
pkg install git wget curl nodejs unzip openjdk-17 -y

# --- 2. Install npm global packages ---
npm install -g firebase-tools vercel gh

# --- 3. Setup repo ---
if [ ! -d "$HOME/aikya-autopilot-upload" ]; then
    echo "Cloning Aikya autopilot repo..."
    git clone git@github.com:manender-coder/Aikya-autopilot-upload.git ~/aikya-autopilot-upload
else
    echo "Updating existing repo..."
    cd ~/aikya-autopilot-upload
    git pull origin main
fi
cd ~/aikya-autopilot-upload

# --- 4. Setup .bashrc kalki function ---
echo "Configuring kalki function in .bashrc..."
cat << 'EOF' >> ~/.bashrc

kalki() {
    cd ~/aikya-autopilot-upload || return
    git add .
    git commit -m "Kalki ♾️" || true
    git push origin main --force

    echo "⚡ Triggering GitHub Actions CI/CD pipeline..."
    gh workflow run main.yml -R manender-coder/Aikya-autopilot-upload
}
EOF

source ~/.bashrc

# --- 5. Node.js dependencies ---
echo "Installing Node.js dependencies..."
npm install
npm run build || echo "⚠️ Build failed. Check package.json"

# --- 6. Android Gradle build ---
if [ -d "android" ]; then
    echo "Building Android AAB..."
    cd android
    ./gradlew clean bundleRelease
    cd ..
else
    echo "⚠️ Android folder not found. Skipping Gradle build."
fi

# --- 7. Firebase setup ---
if [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo "$FIREBASE_SERVICE_ACCOUNT" > firebase-service-account.json
    echo "Deploying to Firebase..."
    firebase deploy --project aikya-spritual-platform --only hosting,functions
else
    echo "⚠️ FIREBASE_SERVICE_ACCOUNT env var not set."
fi

# --- 8. Vercel deploy ---
if [ -n "$VERCEL_TOKEN" ]; then
    echo "Deploying to Vercel..."
    vercel --prod --token $VERCEL_TOKEN
else
    echo "⚠️ VERCEL_TOKEN env var not set."
fi

echo "✅ Aikya autopilot setup complete!"
echo "You can now run 'kalki' to push + trigger CI/CD pipeline."
