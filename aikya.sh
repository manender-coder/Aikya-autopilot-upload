#!/data/data/com.termux/files/usr/bin/bash
# Production-ready Aikya Autopilot
# Location: $HOME/aikya/Aikya-autopilot-upload/aikya.sh

HOME_DIR="$HOME"
PROJ_DIR="$HOME_DIR/aikya/Aikya-autopilot-upload"
LOG="$HOME_DIR/aikya/autopilot.log"
LOCKDIR="$HOME_DIR/aikya/.lock_aikya"
MAX_LOG_LINES=10000
RETRY_EAS=3

timestamp(){ date "+%Y-%m-%d %H:%M:%S %Z"; }

log(){ printf "%s %s\n" "$(timestamp)" "$*" >> "$LOG"; }

rotate_log(){
  if [ -f "$LOG" ]; then
    tail -n $MAX_LOG_LINES "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
  else
    mkdir -p "$(dirname "$LOG")"
    touch "$LOG"
  fi
}

acquire_lock(){
  # non-blocking mkdir lock pattern
  if mkdir "$LOCKDIR" 2>/dev/null; then
    log "LOCK acquired: $LOCKDIR"
    return 0
  else
    return 1
  fi
}
release_lock(){
  rm -rf "$LOCKDIR"
  log "LOCK released"
}

run_cmd(){
  # run command, log stdout+stderr
  log ">>> CMD: $*"
  "$@" >> "$LOG" 2>&1
  return $?
}

safe_cd(){
  cd "$PROJ_DIR" 2>/dev/null || (mkdir -p "$PROJ_DIR" && cd "$PROJ_DIR")
}

# Start
rotate_log
log "----- 🌅 Aikya Autopilot START $(timestamp) -----"

# Prevent concurrent executions
if ! acquire_lock; then
  log "Another autopilot instance is running — exiting"
  exit 0
fi

# Ensure lock released on any exit
trap release_lock EXIT INT TERM

# go to project
safe_cd

# Git sync: pull remote, commit local changes (non-fatal)
if command -v git >/dev/null 2>&1; then
  run_cmd git rev-parse --is-inside-work-tree || true
  run_cmd git fetch origin main || log "git fetch failed, continuing"
  run_cmd git pull origin main --ff-only || log "git pull non-fast-forward or failed; continuing"
  run_cmd git add -A || true
  run_cmd git commit -m "♾️ Auto Aikya Sync $(timestamp)" || true
  run_cmd git push origin main || log "git push failed; continuing"
else
  log "git not installed; skipping git steps"
fi

# Copy vaults/namantaran/captions into public for hosting
run_cmd mkdir -p public
run_cmd mkdir -p public/vaults public/namantaran public/captions
run_cmd cp -r "$PROJ_DIR"/vaults/* public/vaults/ 2>/dev/null || true
run_cmd cp -r "$PROJ_DIR"/namantaran/* public/namantaran/ 2>/dev/null || true
run_cmd cp -r "$PROJ_DIR"/captions/* public/captions/ 2>/dev/null || true

# Firebase deploy (if firebase available and token env provided)
if command -v firebase >/dev/null 2>&1; then
  if [ -n "$FIREBASE_TOKEN" ] || [ -n "$FIREBASE_SERVICE_ACCOUNT" ] || [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    log "Attempting firebase deploy (hosting)"
    run_cmd firebase deploy --only hosting || log "firebase deploy failed"
  else
    log "Firebase CLI present but no credentials env found; skipping firebase deploy"
  fi
else
  log "firebase CLI not found; skipping firebase deploy"
fi

# EAS build (if eas installed) — non-blocking, retries
if command -v eas >/dev/null 2>&1; then
  if [ -n "$EAS_NON_INTERACTIVE" ] || [ -n "$EAS_TOKEN" ]; then
    attempt=1
    while [ $attempt -le $RETRY_EAS ]; do
      log "Attempting EAS build (attempt $attempt/$RETRY_EAS)"
      eas build --platform android --profile production --non-interactive --auto-submit >> "$LOG" 2>&1
      rc=$?
      if [ $rc -eq 0 ]; then
        log "EAS build succeeded on attempt $attempt"
        break
      else
        log "EAS build failed (rc=$rc) — retrying after backoff"
        sleep $((attempt * 10))
      fi
      attempt=$((attempt + 1))
    done
    if [ $attempt -gt $RETRY_EAS ]; then
      log "EAS build failed after $RETRY_EAS attempts — continuing"
    fi
  else
    log "EAS CLI present but no EAS credentials found; skipping EAS build"
  fi
else
  log "EAS CLI not found; skipping EAS build"
fi

# Optional: gh-pages mirror (if gh-pages available and public dir exists)
if command -v gh-pages >/dev/null 2>&1 || command -v npx >/dev/null 2>&1; then
  if [ -d "public" ]; then
    log "Attempting gh-pages publish (if installed)"
    if command -v gh-pages >/dev/null 2>&1; then
      run_cmd gh-pages -d public || log "gh-pages publish failed"
    else
      run_cmd npx gh-pages -d public || log "npx gh-pages publish failed"
    fi
  fi
fi

# Optional notification: whatsapp via callmebot (non-blocking)
# configure PHONE and CALLMEBOT_KEY env or edit below
if [ -n "$CALLMEBOT_PHONE" ] && [ -n "$CALLMEBOT_KEY" ]; then
  lastline=$(tail -n 4 "$LOG" | sed "s/'/\\'/g" | tr '\n' ' ')
  url="https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=$(printf 'Aikya+Update:+%s' "$lastline")&apikey=${CALLMEBOT_KEY}"
  curl -s --max-time 10 "$url" >/dev/null 2>&1 || log "whatsapp notify failed"
fi

# final housekeeping
rotate_log
log "----- ✅ Aikya Autopilot END $(timestamp) -----"

# release lock via trap on exit
exit 0
