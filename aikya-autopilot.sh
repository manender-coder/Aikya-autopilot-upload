#!/data/data/com.termux/files/usr/bin/bash
LOG=~/aikya/autopilot.log
MAXLOG=5000   # keep last 5000 lines

# 🌅 Start
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

# 📱 Android EAS Build + Auto Submit (retry on failure)
export EAS_BUILD_PROFILE=production
export EAS_NON_INTERACTIVE=1
for i in {1..3}; do
    eas build --platform android --profile production --auto-submit >> $LOG 2>&1 && break
    echo "⚠️ EAS build failed, retrying attempt $i..." >> $LOG
    sleep 30
done

# 🌍 GitHub Pages Mirror
gh-pages -d public >> $LOG 2>&1 || true

# 📲 WhatsApp Notification
lastline=$(tail -n 5 $LOG | sed "s//\/g")
curl -X POST "https://api.callmebot.com/whatsapp.php?phone=+918094583006&text=🌅 Aikya+Autopilot+Update:+$lastline&apikey=987654"

# 🧹 Log Rotation
tail -n $MAXLOG $LOG > $LOG.tmp && mv $LOG.tmp $LOG

echo "----- ✅ Full Cycle Completed $(date) -----" >> $LOG

