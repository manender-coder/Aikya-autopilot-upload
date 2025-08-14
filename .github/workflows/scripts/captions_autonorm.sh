#!/usr/bin/env bash
set -Eeuo pipefail

echo "♾ Running Captions + Autonorms..."

run_or_skip () {
  local cmd="$1"
  echo "> $cmd"
  bash -lc "$cmd" || echo "…skipped (non-blocking)"
}

mkdir -p aikya
mkdir -p scripts

# Run captioning
if [ -f scripts/auto_caption.py ]; then
  run_or_skip "python3 scripts/auto_caption.py"
else
  echo "scripts/auto_caption.py not found; creating placeholder captions.json"
  cat > aikya/captions.json <<'JSON'
{"status":"placeholder","items":[]}
JSON
fi

# Run autonorms
if [ -f scripts/auto_norm.py ]; then
  run_or_skip "python3 scripts/auto_norm.py"
else
  echo "scripts/auto_norm.py not found; creating placeholder autonorms.json"
  cat > aikya/autonorms.json <<'JSON'
{"status":"placeholder","rules":[]}
JSON
fi

{
  echo "## ♾ Aikya Autopilot summary"
  echo "- captions: \`aikya/captions.json\`"
  echo "- autonorms: \`aikya/autonorms.json\`"
} >> "$GITHUB_STEP_SUMMARY" || true

echo "♾ Captions & Autonorms complete!"
