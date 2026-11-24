"""make_dossier.py turns an expotition result into numbered, cited facts."""
import json
import pathlib
import subprocess
import sys
import tempfile

SCRIPT = pathlib.Path(__file__).resolve().parent.parent / "skills/hundred-acre-council/make_dossier.py"
SAMPLE = {"result": [
    {"key": "repo", "prefix": "R", "title": "Code", "gaps": ["no CI logs"],
     "facts": [{"claim": "One author", "source": "git shortlog", "as_of": "2026-01-01", "confidence": "verified"},
               {"claim": "Two modules", "source": "README.md@abc", "as_of": "2026-01-01", "confidence": "reported"}]},
    {"key": "usage", "gaps": [],
     "facts": [{"claim": "Zero outside users", "source": "logs", "as_of": "2026-01-02", "confidence": "inferred"}]},
]}

with tempfile.TemporaryDirectory() as d:
    src, out = pathlib.Path(d, "in.json"), pathlib.Path(d, "dossier.md")
    src.write_text(json.dumps(SAMPLE))
    subprocess.run([sys.executable, "-I", str(SCRIPT), str(src), str(out)], check=True)
    text = out.read_text()
    for needle in ["## Code", "R01 [verified, 2026-01-01] One author (source: git shortlog)", "R02 [reported",
                   "U01 [inferred, 2026-01-02] Zero outside users", "no CI logs"]:
        assert needle in text, f"missing: {needle}\n---\n{text}"
print("make_dossier: ok")
