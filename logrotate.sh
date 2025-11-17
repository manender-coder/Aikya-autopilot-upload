#!/data/data/com.termux/files/usr/bin/bash

LOGDIR="$HOME/aikya"
MAXSIZE=10000000  # 10 MB

for f in autopilot.log watchdog.log autostart.log; do
  FILE="$LOGDIR/$f"
  if [ -f "$FILE" ]; then
    SIZE=$(stat -c%s "$FILE")
    if [ "$SIZE" -gt "$MAXSIZE" ]; then
      mv "$FILE" "$FILE.$(date +%Y%m%d%H%M%S)"
      touch "$FILE"
    fi
  fi
done
