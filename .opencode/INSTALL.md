# Installing the working-agreements plugin for opencode

## Overview

The plugin auto-injects the `working-agreements` contract into the first user
message of each session, and auto-registers a skills directory so opencode
discovers the skills with no manual config edits.

The plugin registers a single skills directory so opencode never loads the same
skill twice. It prefers `~/.agents/skills` when that directory already contains
the contract (opencode discovers it natively), and falls back to the repo's
`skills/` when the home install is absent (fresh git-backed spec install).

## Install

### Option A: git-backed plugin spec (recommended)

opencode's plugin manager installs the repo as a npm-style package fetched over
git. The repo ships a `package.json` pointing at the plugin entrypoint, so the
install resolves the bootstrap and the `skills/` directory automatically. Works
on Windows and Unix.

Add the plugin to your `opencode.json` (global at
`~/.config/opencode/opencode.json` on Linux/macOS,
`%USERPROFILE%\.config\opencode\opencode.json` on Windows, or project-level):

```json
{
  "plugin": ["working-agreements@git+https://github.com/CarlosFerOrduna/agent-skills.git"]
}
```

The plugin and its skills are installed into opencode's package cache on first
startup - `install.py` is not required for this install style.

Restart opencode after editing the config - configuration is loaded once at
startup.

### Option B: global plugin file (fallback)

Copy the plugin into opencode's global plugins directory (auto-discovered at
startup, no config edit needed):

```bash
mkdir -p ~/.config/opencode/plugins
cp .opencode/plugins/working-agreements.js ~/.config/opencode/plugins/
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$HOME\.config\opencode\plugins" | Out-Null
Copy-Item .opencode\plugins\working-agreements.js "$HOME\.config\opencode\plugins\"
```

The plugin reads the bootstrap from `~/.agents/skills/`, so run
`python install.py` first (or copy the skills folders manually). To update,
copy the plugin file again after pulling the latest commit.

## Usage

After restart, start a new conversation. The contract is injected into the
first user message, which tells the model to honor the agreements before any
response or action.

Use opencode's native `skill` tool to list and load skills:

- `skill` → list available skills
- `skill` with `name: working-agreements` → load the standards

## How it works

The plugin registers two hooks:

- **`config`**: pushes the resolved `skills/` directory into
  `config.skills.paths`.
- **`experimental.chat.messages.transform`**: injects the
  `working-agreements` contract (read once and cached from
  `skills/working-agreements/SKILL.md` or
  `~/.agents/skills/working-agreements/SKILL.md`) into the first user message
  of each session.

The contract instructs the model to honor the agreements and load the matching
stack skill for the task, and maps skill actions to opencode's native tools.

## Troubleshooting

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i working-agreements`
2. Verify the plugin file is in `~/.config/opencode/plugins/` and is a fresh copy.
3. Confirm `python install.py` has been run so `~/.agents/skills/` exists.
4. Use `skill` tool to list what's discovered.
