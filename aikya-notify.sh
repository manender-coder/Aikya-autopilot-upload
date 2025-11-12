#!/data/data/com.termux/files/usr/bin/bash
# 🌅 Aikya Autopilot WhatsApp + SMS Notifier
logfile=~/aikya/autopilot.log
lastline=$(tail -n 5 "$logfile" | sed "s//\/g")
phone="8094583006"        # your number without +91
apikey="987654"           # 🔑 replace with your real CallMeBot API key
msg="🌅 Aikya+Autopilot+Update:+$lastline"

# --- WhatsApp send ---
curl -s -X POST "https://api.callmebot.com/whatsapp.php?phone=$phone&text=$msg&apikey=$apikey" \
|| {
  echo "⚠️ WhatsApp failed, trying SMS..." >> "$logfile"
  # --- SMS fallback ---
  curl -s "https://api.callmebot.com/sms.php?phone=$phone&text=$msg&apikey=$apikey" >> "$logfile" 2>&1
}
echo "✅ Notification cycle executed $(date)" >> "$logfile"

