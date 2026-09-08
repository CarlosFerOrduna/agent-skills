#!/usr/bin/env python3
"""Install editor-agnostic agent skills.

Copies every skill in ./skills to the user's global skills directory
(~/.agents/skills), which is read by Zed, opencode, Claude Code, and other
tools following the AGENTS.md / SKILL.md convention.

Ownership is tracked in a manifest (`.agent-skills.json`) so upgrades work
instead of a blind skip. Directories this installer recorded as its own are
replaced (an `UPDATE 'name' old -> new` line is printed when the version
differs). A destination WITHOUT a manifest is adopted on first run only for the
names and version the installer actually published before the manifest existed
(v0.2.0) whose SKILL.md `name:` matches; everything else existing there is
foreign and is skipped unless `--force` is passed.

Usage:
    python install.py                # install new skills, upgrade owned ones,
                                     # skip foreign directories
    python install.py --force        # also replace foreign skill directories
    python install.py --prune        # also remove owned skills no longer shipped

--prune removes directories that a previous run of this installer recorded but
that no longer exist in ./skills (for example using-working-agreements from
installs before 0.2.0). It never deletes skills it did NOT install, so foreign
skill directories in ~/.agents/skills are left alone.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SOURCE_DIR = REPO_ROOT / "skills"
DEST_ROOT = Path.home() / ".agents" / "skills"
MANIFEST = ".agent-skills.json"
LEGACY = ("using-working-agreements",)

# Nombres que el installer publicó ANTES de existir el manifest (v0.2.0).
# Es una lista de migración, no un catálogo: si crece, la adopción deja de
# distinguir "instalación vieja mía" de "skill ajena con el mismo nombre".
KNOWN_PRIOR = {"commit-conventions", "database", "nestjs-code-style", "testing-standards", "working-agreements"}
# Única versión publicada antes del manifest.
PRIOR_VERSION = "0.2.0"

FRONTMATTER_RE = re.compile(r"^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)", re.MULTILINE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install agent skills to ~/.agents/skills"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="also replace foreign skill directories at the destination",
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


def frontmatter_field(directory: Path, field: str) -> str:
    """Read `name:`/`version:` from a skill's SKILL.md frontmatter."""
    skill_file = directory / "SKILL.md"
    if not skill_file.is_file():
        return "?"
    try:
        text = skill_file.read_text(encoding="utf-8")[:4096]
    except OSError:
        return "?"
    match = FRONTMATTER_RE.search(text)
    if not match:
        return "?"
    for line in match.group(1).splitlines():
        key, _, value = line.partition(":")
        if key.strip() == field:
            return value.strip()
    return "?"


def skill_name(skill: Path) -> str:
    return frontmatter_field(skill, "name")


def skill_version(skill: Path) -> str:
    return frontmatter_field(skill, "version")


def replace(skill: Path, dest: Path) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(skill, dest)


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
    previous = read_manifest()
    # La adopción es un evento único de migración: solo un destino sin manifest
    # viene de antes de que el manifest existiera (v0.2.0).
    adopting = not (DEST_ROOT / MANIFEST).is_file()

    if args.prune:
        prune(previous, current)

    owned: set[str] = set()
    skipped_foreign: list[str] = []
    for skill in skills:
        dest = DEST_ROOT / skill.name
        if not dest.exists():
            print(f"INSTALL '{skill.name}' -> {dest}")
            shutil.copytree(skill, dest)
            owned.add(skill.name)
            continue

        owned_target = skill.name in previous
        if not owned_target:
            # Adopción: un directorio existente es nuestro solo cuando el
            # destino no tenía manifest, el nombre estaba publicado antes de
            # que el manifest existiera, la versión es la de esa época y el
            # `name:` del frontmatter coincide con la carpeta. Todo lo demás es
            # ajeno y se reemplaza únicamente con --force.
            if (
                adopting
                and skill.name in KNOWN_PRIOR
                and skill_version(dest) == PRIOR_VERSION
                and skill_name(dest) == skill.name
            ):
                owned_target = True
                print(f"ADOPT '{skill.name}' ({skill_version(dest)})")

        if owned_target:
            dest_version = skill_version(dest)
            source_version = skill_version(skill)
            if dest_version != source_version:
                print(f"UPDATE '{skill.name}' {dest_version} -> {source_version} ({dest})")
                replace(skill, dest)
            else:
                print(f"OK '{skill.name}' (already at {source_version})")
            owned.add(skill.name)
        elif args.force:
            print(f"REPLACE '{skill.name}' (foreign) -> {dest}")
            replace(skill, dest)
            owned.add(skill.name)
        else:
            print(f"SKIP '{skill.name}' -> {dest} (not tracked by this installer; use --force to replace)")
            skipped_foreign.append(skill.name)

    write_manifest(owned)

    if skipped_foreign:
        skipped = ", ".join(f"'{name}'" for name in skipped_foreign)
        count = len(skipped_foreign)
        noun = "skill" if count == 1 else "skills"
        print(f"{count} {noun} skipped (foreign: {skipped}); run --force to replace")

    print()
    print(f"Done. Skills installed to {DEST_ROOT}")
    print(
        "Restart your editor (Zed / opencode / Claude Code) to pick up the new skills."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
