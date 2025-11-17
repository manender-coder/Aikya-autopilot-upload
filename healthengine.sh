#!/data/data/com.termux/files/usr/bin/bash
LOG="$HOME/aikya/healthengine.log"
AUTOPILOT="$HOME/aikya/Aikya-autopilot-upload/aikya.sh"

echo "[HealthEngine] Run at $(date)" >> "$LOG"

# if autopilot dead → restart
if ! pgrep -f "aikya-autopilot-upload/aikya.sh" >/dev/null; then
  echo "[HealthEngine] Restarting Autopilot" >> "$LOG"
  bash "$AUTOPILOT" >> $HOME/aikya/autopilot.log 2>&1 &
fi

# if log stale → restart
LAST=$(stat -c %Y "$HOME/aikya/autopilot.log")
NOW=$(date +%s)
AGE=$((NOW - LAST))
if [ $AGE -gt 1800 ]; then
  echo "[HealthEngine] Autopilot stale → hard restart" >> "$LOG"
  pkill -f "aikya-autopilot-upload/aikya.sh"
  sleep 1
  bash "$AUTOPILOT" >> $HOME/aikya/autopilot.log 2>&1 &
fi
