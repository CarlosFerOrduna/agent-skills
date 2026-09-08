#!/usr/bin/env python3
"""Install editor-agnostic agent skills.

Copies every skill in ./skills to the user's global skills directory
(~/.agents/skills), which is read by Zed, opencode, Claude Code, and other
tools following the AGENTS.md / SKILL.md convention.

Usage:
    python install.py                # install new skills, skip existing ones
    python install.py --force        # replace existing skills
    python install.py --prune        # also remove skills no longer shipped

--prune removes directories that a previous run of this installer recorded but
that no longer exist in ./skills (for example using-working-agreements from
installs before 0.2.0). It never deletes skills it did NOT install, so foreign
skill directories in ~/.agents/skills are left alone.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SOURCE_DIR = REPO_ROOT / "skills"
DEST_ROOT = Path.home() / ".agents" / "skills"
MANIFEST = ".agent-skills.json"
LEGACY = ("using-working-agreements",)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install agent skills to ~/.agents/skills"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="replace skills that already exist at the destination",
    )
    parser.add_argument(
        "--prune",
        action="store_true",
        help="remove previously installed skills that are no longer shipped",
    )
    return parser.parse_args()


def read_manifest() -> set[str]:
    manifest_path = DEST_ROOT / MANIFEST
    if not manifest_path.is_file():
        return set()
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (ValueError, OSError):
        return set()
    return set(data.get("skills", []))


def write_manifest(skills: set[str]) -> None:
    manifest_path = DEST_ROOT / MANIFEST
    manifest_path.write_text(
        json.dumps({"skills": sorted(skills)}, indent=2) + "\n",
        encoding="utf-8",
    )


def prune(previous: set[str], current: set[str]) -> None:
    orphans = {DEST_ROOT / name for name in previous - current}
    for legacy in LEGACY:
        legacy_path = DEST_ROOT / legacy
        if legacy_path.is_dir():
            orphans.add(legacy_path)
    for target in sorted(orphans):
        if target.is_dir():
            print(f"PRUNE '{target.name}' -> {target}")
            shutil.rmtree(target)


def main() -> int:
    args = parse_args()

    if not SOURCE_DIR.is_dir():
        print(f"ERROR: skills directory not found: {SOURCE_DIR}", file=sys.stderr)
        return 1

    DEST_ROOT.mkdir(parents=True, exist_ok=True)

    skills = [p for p in SOURCE_DIR.iterdir() if p.is_dir()]
    if not skills:
        print(f"WARNING: no skills found under {SOURCE_DIR}")
        return 0

    current = {skill.name for skill in skills}

    if args.prune:
        prune(read_manifest(), current)

    for skill in skills:
        dest = DEST_ROOT / skill.name
        if dest.exists():
            if not args.force:
                print(f"SKIP '{skill.name}' -> {dest} (exists; use --force to replace)")
                continue
            print(f"REPLACE '{skill.name}' -> {dest}")
            shutil.rmtree(dest)
        else:
            print(f"INSTALL '{skill.name}' -> {dest}")
        shutil.copytree(skill, dest)

    write_manifest(current)

    print()
    print(f"Done. Skills installed to {DEST_ROOT}")
    print(
        "Restart your editor (Zed / opencode / Claude Code) to pick up the new skills."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
