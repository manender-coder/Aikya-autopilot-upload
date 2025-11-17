#!/data/data/com.termux/files/usr/bin/bash

while true; do
  # HealthEngine
  if ! pgrep -f "healthengine.sh" >/dev/null 2>&1; then
    echo "[Immortal] Restarting HealthEngine at $(date)" >> $HOME/aikya/immortal.log
    bash $HOME/aikya/healthengine.sh >/dev/null 2>&1 &
  fi

  # GitWatch
  if ! pgrep -f "gitwatch.sh" >/dev/null 2>&1; then
    echo "[Immortal] Restarting GitWatch at $(date)" >> $HOME/aikya/immortal.log
    bash $HOME/aikya/gitwatch.sh >/dev/null 2>&1 &
  fi

  sleep 10
done
