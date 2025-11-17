#!/data/data/com.termux/files/usr/bin/bash
REPO="$HOME/aikya/Aikya-autopilot-upload"
REMOTE="https://github.com/manender-coder/aikya-autopilot-upload.git"
LOG="$HOME/aikya/gitwatch.log"

echo "[GitWatch] Run at $(date)" >> "$LOG"

if [ ! -d "$REPO/.git" ]; then
  echo "[GitWatch] Repo missing — cloning" >> "$LOG"
  rm -rf "$REPO"
  git clone "$REMOTE" "$REPO" >> "$LOG" 2>&1
  exit 0
fi

cd "$REPO"

git fetch -q
LOCAL=$(git rev-parse HEAD)
REMOTEHASH=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTEHASH" ]; then
  echo "[GitWatch] Update found → pulling" >> "$LOG"
  git pull --rebase >> "$LOG" 2>&1
  pkill -f "aikya-autopilot-upload/aikya.sh"
  sleep 1
  bash "$REPO/aikya.sh" >> $HOME/aikya/autopilot.log 2>&1 &
else
  echo "[GitWatch] Up to date" >> "$LOG"
fi
