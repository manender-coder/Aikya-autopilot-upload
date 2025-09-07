#!/bin/bash
# ♾️ Chhota Aikya Full Kotlin Firebase Autopilot

# Detect project root
if [ -d "app" ]; then
    PROJECT_ROOT=$(pwd)
else
    PROJECT_ROOT=$(find .. -type d -name "app" | head -n1 | xargs dirname)
    if [ -z "$PROJECT_ROOT" ]; then
        echo "❌ Cannot find project root with 'app/' folder"
        exit 1
    fi
fi

APP_DIR="$PROJECT_ROOT/app"
APP_BUILD="$APP_DIR/build.gradle"
MAIN_ACTIVITY="$APP_DIR/src/main/java/com/aikya/spritual/platform/MainActivity.kt"

echo "♾️ Project root: $PROJECT_ROOT"
echo "♾️ App folder: $APP_DIR"

# Step 1: Check google-services.json
if [ ! -f "$APP_DIR/google-services.json" ]; then
    echo "❌ google-services.json missing in $APP_DIR"
    exit 1
fi
echo "✅ google-services.json found"

# Step 2: Apply Firebase plugin
if ! grep -q "com.google.gms.google-services" "$APP_BUILD"; then
    sed -i "1i apply plugin: 'com.google.gms.google-services'" "$APP_BUILD"
    echo "✅ Firebase plugin applied"
else
    echo "✅ Firebase plugin already applied"
fi

# Step 3: Add Kotlin & Firebase KTX dependencies
if ! grep -q "firebase-bom" "$APP_BUILD"; then
    cat <<EOL >> "$APP_BUILD"

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib:1.9.0"
    implementation platform('com.google.firebase:firebase-bom:32.2.0')
    implementation 'com.google.firebase:firebase-analytics-ktx'
    implementation 'com.google.firebase:firebase-auth-ktx'
    implementation 'com.google.firebase:firebase-firestore-ktx'
    implementation 'com.google.firebase:firebase-storage-ktx'
}
EOL
    echo "✅ Kotlin & Firebase KTX dependencies added"
else
    echo "✅ Firebase dependencies already present"
fi

# Step 4: Initialize MainActivity.kt
if [ ! -f "$MAIN_ACTIVITY" ]; then
    mkdir -p "$(dirname "$MAIN_ACTIVITY")"
    cat <<EOL > "$MAIN_ACTIVITY"
package com.aikya.spritual.platform

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.FirebaseApp

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        FirebaseApp.initializeApp(this)
    }
}
EOL
    echo "✅ MainActivity.kt created with Firebase initialization"
else
    echo "✅ MainActivity.kt already exists, ensure FirebaseApp.initializeApp(this) is called"
fi

# Step 5: Generate default Firestore rules
FIRESTORE_RULES="$PROJECT_ROOT/firestore.rules"
cat <<EOL > "$FIRESTORE_RULES"
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOL
echo "✅ Firestore rules created at $FIRESTORE_RULES"

# Step 6: Generate default Storage rules
STORAGE_RULES="$PROJECT_ROOT/storage.rules"
cat <<EOL > "$STORAGE_RULES"
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOL
echo "✅ Storage rules created at $STORAGE_RULES"

# Step 7: Instructions for user
echo "♾️ Full Kotlin Firebase Autopilot setup completed!"
echo "Next steps:"
echo "1. Import project in Android Studio"
echo "2. Sync Gradle"
echo "3. Deploy Firestore rules: firebase deploy --only firestore:rules"
echo "4. Deploy Storage rules: firebase deploy --only storage:rules"
echo "5. Test your app; Email/Password Auth is enabled"
