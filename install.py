#!/usr/bin/env python3
"""Install editor-agnostic agent skills.

Copies every skill in ./skills to the user's global skills directory
(~/.agents/skills), which is read by Zed, opencode, Claude Code, and
other tools following the AGENTS.md / SKILL.md convention.

Usage:
    python install.py                # install new skills, skip existing ones
    python install.py --force        # replace existing skills
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SOURCE_DIR = REPO_ROOT / "skills"
DEST_ROOT = Path.home() / ".agents" / "skills"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install agent skills to ~/.agents/skills"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="replace skills that already exist at the destination",
    )
    return parser.parse_args()


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

    print()
    print(f"Done. Skills installed to {DEST_ROOT}")
    print(
        "Restart your editor (Zed / opencode / Claude Code) to pick up the new skills."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
