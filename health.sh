#!/data/data/com.termux/files/usr/bin/bash

LOG="$HOME/aikya/health.log"
AUTOPILOT="$HOME/aikya/Aikya-autopilot-upload/aikya.sh"

echo "[HealthCheck] Run at $(date)" >> "$LOG"

# 1. Check if autopilot is running
if ! pgrep -f "aikya-autopilot-upload/aikya.sh" >/dev/null 2>&1; then
  echo "[HealthCheck] Autopilot not running — restarting" >> "$LOG"
  bash "$AUTOPILOT" >> $HOME/aikya/autopilot.log 2>&1 &
fi

# 2. Check if last autopilot update is older than 30 minutes
LAST_UPDATE=$(stat -c %Y "$HOME/aikya/autopilot.log")
NOW=$(date +%s)
AGE=$((NOW - LAST_UPDATE))

if [ $AGE -gt 1800 ]; then
  echo "[HealthCheck] Autopilot log stale ($AGE sec) — forcing restart" >> "$LOG"
  pkill -f "aikya-autopilot-upload/aikya.sh"
  sleep 2
  bash "$AUTOPILOT" >> $HOME/aikya/autopilot.log 2>&1 &
fi

# 3. Check if log file is too large
SIZE=$(stat -c%s "$HOME/aikya/autopilot.log")
if [ "$SIZE" -gt 50000000 ]; then
  echo "[HealthCheck] Log exceeded 50MB — rotating" >> "$LOG"
  mv "$HOME/aikya/autopilot.log" "$HOME/aikya/autopilot.log.$(date +%Y%m%d%H%M%S)"
  touch "$HOME/aikya/autopilot.log"
fi

echo "[HealthCheck] Done" >> "$LOG"
