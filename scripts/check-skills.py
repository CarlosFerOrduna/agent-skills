#!/usr/bin/env python3
"""Validate the skills repo consistency.

Checks, run in CI (see .github/workflows/ci.yml):
  - every skills/<name>/SKILL.md has valid frontmatter (name == folder,
    non-empty description, version matching package.json);
  - the "Stack skills" index in working-agreements matches the actual skill set;
  - the "# Contract version" section matches package.json;
  - the README mentions every skill;
  - no file resurrects the archived using-working-agreements bootstrap.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
FILES = {".md", ".py", ".cjs", ".mjs", ".js", ".yaml", ".yml", ".json"}


def parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    fields: dict[str, str] = {}
    for line in text.split("---", 2)[1].strip().splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()
    return fields


def fail(msg: str) -> None:
    print(f"FAIL {msg}")
    sys.exit(1)


def main() -> int:
    pkg_version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]

    skills = sorted(p.name for p in SKILLS.iterdir() if p.is_dir())
    if not skills:
        fail("no skills found")

    for name in skills:
        path = SKILLS / name / "SKILL.md"
        if not path.is_file():
            fail(f"skill {name!r} missing SKILL.md")
        fm = parse_frontmatter(path.read_text(encoding="utf-8"))
        if fm.get("name") != name:
            fail(f"{name}/SKILL.md frontmatter name mismatch: {fm.get('name')!r}")
        if not fm.get("description"):
            fail(f"{name}/SKILL.md missing description")
        if fm.get("version") != pkg_version:
            fail(f"{name}/SKILL.md version {fm.get('version')!r} != package.json {pkg_version!r}")

    wa_text = (SKILLS / "working-agreements" / "SKILL.md").read_text(encoding="utf-8")
    indexed = set(re.findall(r"^\s*- `([a-z0-9-]+)` —", wa_text, re.M))
    stack = set(skills) - {"working-agreements"}
    if indexed != stack:
        fail(f"contract stack index drift: missing={sorted(stack - indexed)} "
             f"extra={sorted(indexed - stack)}")

    match = re.search(r"\*\*v([0-9][0-9a-z.-]*)\*\*", wa_text)
    if not match or match.group(1) != pkg_version:
        fail(f"contract version section mismatch: {match.group(1) if match else 'none'} != {pkg_version}")

    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for name in skills:
        if name not in readme:
            fail(f"README does not mention skill {name!r}")

    stale = ("using-working-agreements",)
    for path in ROOT.rglob("*"):
        if not path.is_file() or ".git" in path.parts:
            continue
        if path.resolve() == Path(__file__).resolve():
            continue
        if path.suffix.lower() not in FILES:
            continue
        content = path.read_text(encoding="utf-8", errors="ignore")
        for name in stale:
            if name in content:
                fail(f"stale reference to {name!r} in {path.relative_to(ROOT)}")

    print(f"PASS {len(skills)} skills, versions @ {pkg_version}, index and README in sync")
    return 0


if __name__ == "__main__":
    sys.exit(main())