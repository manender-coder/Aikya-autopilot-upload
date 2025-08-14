#!/usr/bin/env python3
import json, os, re, time

caps_path = "aikya/captions.json"
items = []
if os.path.exists(caps_path):
    with open(caps_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        items = data.get("items", [])

def slugify(t: str) -> str:
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t or "untitled"

rules = []
for it in items:
    base = os.path.splitext(it["file"])[0]
    rules.append({
        "file": it["file"],
        "norm_slug": slugify(base),
        "caption_len": len(it.get("caption","")),
    })

out = {
    "generated_at": int(time.time()),
    "rules": rules,
}

os.makedirs("aikya", exist_ok=True)
with open("aikya/autonorms.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f"wrote aikya/autonorms.json with {len(rules)} rule(s)")
