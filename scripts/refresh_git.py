#!/usr/bin/env python3
"""Actualiza lastCommit, lastCommitMsg y commits en data/projects.json
leyendo los repos locales que apunta el campo `path` de cada proyecto.

Uso:  python3 scripts/refresh_git.py
No toca el avance ni los hitos: eso se edita a mano.
"""

import json
import pathlib
import subprocess
import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "projects.json"


def git(repo, *args):
    try:
        out = subprocess.run(
            ["git", "-C", str(repo), *args],
            capture_output=True, text=True, timeout=20,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    return out.stdout.strip() if out.returncode == 0 else None


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    changed = []

    for p in data["projects"]:
        rel = p.get("path")
        if not rel:
            continue
        repo = (ROOT / rel).resolve()
        if not (repo / ".git").exists():
            continue

        date = git(repo, "log", "-1", "--date=short", "--format=%ad")
        msg = git(repo, "log", "-1", "--format=%s")
        count = git(repo, "rev-list", "--count", "HEAD")

        if date and date != p.get("lastCommit"):
            changed.append(f'{p["short"]}: {p.get("lastCommit") or "—"} -> {date}')
        if date:
            p["lastCommit"] = date
        if msg:
            p["lastCommitMsg"] = msg
        if count and count.isdigit():
            p["commits"] = int(count)

    data["updated"] = datetime.date.today().isoformat()
    DATA.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    print(f"{DATA.relative_to(ROOT)} actualizado ({data['updated']})")
    for line in changed:
        print("  " + line)
    if not changed:
        print("  sin commits nuevos")


if __name__ == "__main__":
    main()
