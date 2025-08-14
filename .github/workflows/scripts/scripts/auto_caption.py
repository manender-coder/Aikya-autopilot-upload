#!/usr/bin/env python3
import json, os, time

media_dir = os.getenv("AIKYA_MEDIA_DIR", "media")
items = []

if os.path.isdir(media_dir):
    for name in sorted(os.listdir(media_dir)):
        p = os.path.join(media_dir, name)
        if os.path.isfile(p):
            items.append({"file": name, "caption": f"Auto caption for {name}"})

out = {
    "generated_at": int(time.time()),
    "source_dir": media_dir,
    "items": items,
}

os.makedirs("aikya", exist_ok=True)
with open("aikya/captions.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f"wrote aikya/captions.json with {len(items)} item(s)")
