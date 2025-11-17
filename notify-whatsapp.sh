#!/data/data/com.termux/files/usr/bin/bash
BASE="$HOME/aikya"
LOG="$BASE/notify.log"
PHONE="${CALLMEBOT_PHONE:-+918094583006}"
KEY="${CALLMEBOT_KEY:-987654}"
log(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }
lastline=$(tail -n 6 "$BASE/autopilot.log" 2>/dev/null | tr '\n' ' ')
msg=$(printf "%s" "Aikya update: $lastline" | jq -sRr @uri)
if [ -n "$PHONE" ] && [ -n "$KEY" ]; then
  curl -s --max-time 10 "https://api.callmebot.com/whatsapp.php?phone=${PHONE}&text=${msg}&apikey=${KEY}" >>"$LOG" 2>&1 || log "notify failed"
else
  log "notify env not set"
fi
