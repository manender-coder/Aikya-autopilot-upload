#!/usr/bin/env bash
set -e

echo "→ auto_caption.py"
if [ -f scripts/auto_caption.py ]; then
  python3 scripts/auto_caption.py || true
else
  echo "   (no scripts/auto_caption.py — skipping)"
fi

echo "→ auto_norm.py"
if [ -f scripts/auto_norm.py ]; then
  python3 scripts/auto_norm.py || true
else
  echo "   (no scripts/auto_norm.py — skipping)"
fi
