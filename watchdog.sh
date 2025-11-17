#!/data/data/com.termux/files/usr/bin/bash

while true; do
  if ! pgrep -f "aikya-autopilot-upload/aikya.sh" >/dev/null 2>&1; then
    echo "[Watchdog] Restarting Aikya at $(date)" >> $HOME/aikya/watchdog.log
    bash $HOME/aikya/Aikya-autopilot-upload/aikya.sh >> $HOME/aikya/autopilot.log 2>&1 &
  fi
  sleep 60
done
