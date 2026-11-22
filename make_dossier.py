"""Turn an expotition workflow result into a numbered dossier.md.

Usage: python3 -I make_dossier.py <workflow output file or result json> <out dossier.md>

Accepts either the task output file (an object with a "result" list) or the bare
result list. Each gatherer entry needs key, facts, gaps, and optionally prefix
and title (the original platformx run used a fixed prefix map instead).
"""
import json
import sys

FALLBACK = {
    "repo": ("R", "Code and docs on main"),
    "usage": ("U", "Use, adoption and cost"),
    "jira": ("J", "Jira and Confluence"),
    "history": ("H", "History, promises and strategy"),
}

src, dst = sys.argv[1], sys.argv[2]
data = json.load(open(src))
if isinstance(data, dict):
    data = data["result"]

lines, gaps = [], []
for g in data:
    prefix = g.get("prefix") or FALLBACK.get(g["key"], (g["key"][0].upper(), g["key"]))[0]
    title = g.get("title") or FALLBACK.get(g["key"], (None, g["key"]))[1]
    lines.append(f"## {title}")
    for i, f in enumerate(g["facts"], 1):
        lines.append(f"{prefix}{i:02d} [{f['confidence']}, {f['as_of']}] {f['claim']} (source: {f['source']})")
    gaps += [f"- ({g['key']}) {x}" for x in g["gaps"]]
    print(f"{g['key']}: {len(g['facts'])} facts, {len(g['gaps'])} gaps")

lines.append("## Gaps the gatherers could not close")
lines += gaps
open(dst, "w").write("\n".join(lines) + "\n")
