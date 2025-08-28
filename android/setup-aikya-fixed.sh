#!/data/data/com.termux/files/usr/bin/bash

echo "⚡ Starting FIXED Aikya autopilot setup..."

# --- 1. Update Termux packages ---
pkg update -y && pkg upgrade -y
pkg install git wget curl nodejs unzip openjdk-17 -y

# --- 2. Install npm global packages ---
npm install -g firebase-tools vercel gh

# --- 3. Check repo existence ---
if [ ! -d "$HOME/aikya-autopilot-upload" ]; then
    echo "Cloning Aikya autopilot repo..."
    git clone git@github.com:manender-coder/Aikya-autopilot-upload.git ~/aikya-autopilot-upload
else
    echo "Updating existing repo..."
    cd ~/aikya-autopilot-upload
    git pull origin main
fi
cd ~/aikya-autopilot-upload

# --- 4. Fix .bashrc kalki function ---
echo "Configuring kalki function in .bashrc..."
sed -i '/kalki()/d' ~/.bashrc  # remove previous faulty function
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

# --- 5. Environment variables check ---
if [ -z "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo "⚠️ FIREBASE_SERVICE_ACCOUNT not set. Please export it:"
    echo "export FIREBASE_SERVICE_ACCOUNT='{\"type\":...}'"
fi
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️ VERCEL_TOKEN not set. Please export it:"
    echo "export VERCEL_TOKEN='your_vercel_token'"
fi

# --- 6. Node.js dependencies & build ---
if [ -f package.json ]; then
    echo "Installing Node.js dependencies..."
    npm install
    npm run lint || echo "⚠️ Lint errors found, fix before build."
    npm run build || echo "⚠️ Build failed. Check pages and components."
else
    echo "⚠️ package.json not found. Make sure you are in the correct repo."
fi

# --- 7. Android Gradle build ---
if [ -d "android" ]; then
    echo "Building Android AAB..."
    cd android
    if [ ! -f gradlew ]; then
        echo "⚠️ gradlew missing. Creating wrapper..."
        ./gradle wrapper
    fi
    ./gradlew clean bundleRelease
    cd ..
else
    echo "⚠️ Android folder not found. Skipping Gradle build."
fi

# --- 8. Firebase deploy ---
if [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo "$FIREBASE_SERVICE_ACCOUNT" > firebase-service-account.json
    firebase deploy --project aikya-spritual-platform --only hosting,functions
fi

# --- 9. Vercel deploy ---
if [ -n "$VERCEL_TOKEN" ]; then
    vercel --prod --token $VERCEL_TOKEN
fi

echo "✅ FIXED Aikya autopilot setup complete!"
echo "You can now run 'kalki' to push + trigger CI/CD pipeline."
