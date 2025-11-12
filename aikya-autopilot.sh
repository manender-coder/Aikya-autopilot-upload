#!/data/data/com.termux/files/usr/bin/bash
cd ~/aikya || exit
echo "----- 🌅 $(date): Starting Eternal Aikya Autopilot -----" >> ~/aikya/autopilot.log
git pull origin main >> ~/aikya/autopilot.log 2>&1
git add . && git commit -m "♾️ Auto Aikya Sync $(date)" >> ~/aikya/autopilot.log 2>&1 || true
git push origin main >> ~/aikya/autopilot.log 2>&1 || true
firebase deploy --only hosting >> ~/aikya/autopilot.log 2>&1 || true
eas build --platform android --profile production --auto-submit >> ~/aikya/autopilot.log 2>&1 || true
gh-pages -d public >> ~/aikya/autopilot.log 2>&1 || true
echo "----- ✅ Full Cycle Completed $(date) -----" >> ~/aikya/autopilot.log
