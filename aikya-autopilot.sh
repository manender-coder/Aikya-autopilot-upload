#!/data/data/com.termux/files/usr/bin/bash
LOG=~/aikya/autopilot.log
echo "----- 🌅 $(date): Starting Eternal Aikya Autopilot -----" >> $LOG

# 🔮 Sync Vaults, Namantaran, Captions
cp -r ~/aikya/vaults/* ~/aikya/public/vaults/ 2>/dev/null || true
cp -r ~/aikya/namantaran/* ~/aikya/public/namantaran/ 2>/dev/null || true
cp -r ~/aikya/captions/* ~/aikya/public/captions/ 2>/dev/null || true

# 🧠 Git Autopush
cd ~/aikya || exit
git pull origin main >> $LOG 2>&1
git add . >> $LOG 2>&1
git commit -m "♾️ Auto Aikya Sync $(date)" >> $LOG 2>&1 || true
git push origin main >> $LOG 2>&1 || true

# 🌐 Firebase Hosting Deploy
firebase deploy --only hosting >> $LOG 2>&1

# 📱 Android EAS Build + Auto Submit
export EAS_BUILD_PROFILE=production
export EAS_NON_INTERACTIVE=1
eas build --platform android --profile production --auto-submit >> $LOG 2>&1

# 🌍 GitHub Pages Mirror
gh-pages -d public >> $LOG 2>&1 || true

# 📲 WhatsApp Notification
lastline=$(tail -n 5 $LOG | sed "s//\/g")
curl -X POST "https://api.callmebot.com/whatsapp.php?phone=+918094583006&text=🌅 Aikya+Autopilot+Update:+$lastline&apikey=987654"

echo "----- ✅ Full Cycle Completed $(date) -----" >> $LOG

