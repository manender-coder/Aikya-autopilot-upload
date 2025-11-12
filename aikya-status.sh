#!/data/data/com.termux/files/usr/bin/bash
# 🌸 Aikya Autopilot Live Status Monitor
# Checks: GitHub Actions, Firebase, Expo/EAS

echo "🔮 Checking Aikya Autopilot Live Status..."
echo "------------------------------------------"

# GitHub Actions Status
echo "📦 GitHub Autopilot Workflows:"
gh run list --repo manender-coder/aikya-autopilot-upload --limit 3

echo ""
# Firebase Hosting Status
echo "🔥 Firebase Hosting Deploys:"
firebase hosting:versions:list --project aikya-spritual --limit 3 2>/dev/null || echo "⚠️ Firebase CLI not logged in"

echo ""
# EAS Project Status
echo "📱 EAS/Expo Project Info:"
eas project:info || echo "⚠️ EAS CLI not logged in"

echo ""
echo "✅ All systems checked. Visit:"
echo "   • Firebase: https://console.firebase.google.com/project/aikya-spritual/overview"
echo "   • Expo: https://expo.dev/accounts/manender-coder/projects/aikya"
echo "   • GitHub: https://github.com/manender-coder/aikya-autopilot-upload/actions"
echo ""
echo "🕉️ Aikya Autopilot — Swayam Mode Active"
