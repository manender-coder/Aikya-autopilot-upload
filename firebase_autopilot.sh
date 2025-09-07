#!/bin/bash
# ♾️ Chhota Aikya Firebase Autopilot - Fully Foolproof

# Determine project root (where 'app' folder exists)
if [ -d "app" ]; then
    PROJECT_ROOT=$(pwd)
else
    echo "Looking for project root..."
    PROJECT_ROOT=$(find .. -type d -name "app" | head -n1 | xargs dirname)
    if [ -z "$PROJECT_ROOT" ]; then
        echo "❌ Cannot find project root containing 'app/' folder"
        exit 1
    fi
fi

APP_DIR="$PROJECT_ROOT/app"
APP_BUILD="$APP_DIR/build.gradle"

echo "♾️ Project root detected: $PROJECT_ROOT"
echo "♾️ App folder: $APP_DIR"

# Check google-services.json
if [ ! -f "$APP_DIR/google-services.json" ]; then
    echo "❌ google-services.json not found in $APP_DIR"
    exit 1
else
    echo "✅ google-services.json found"
fi

# Apply Firebase plugin
if ! grep -q "com.google.gms.google-services" "$APP_BUILD"; then
    sed -i "1i apply plugin: 'com.google.gms.google-services'" "$APP_BUILD"
    echo "✅ Firebase plugin applied to app/build.gradle"
else
    echo "✅ Firebase plugin already applied"
fi

# Add Firebase dependencies
if ! grep -q "firebase-bom" "$APP_BUILD"; then
    cat <<EOL >> "$APP_BUILD"

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.2.0')
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-firestore'
    implementation 'com.google.firebase:firebase-storage'
}
EOL
    echo "✅ Firebase dependencies added to app/build.gradle"
else
    echo "✅ Firebase dependencies already present"
fi

echo "♾️ Chhota Aikya Firebase Autopilot setup completed successfully!"
