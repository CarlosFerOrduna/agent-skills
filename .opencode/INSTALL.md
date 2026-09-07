# Installing the working-agreements plugin for opencode

## Overview

The plugin auto-injects the `using-working-agreements` bootstrap skill into the
first user message of each session, and auto-registers a skills directory so
opencode discovers the skills with no manual config edits.

The plugin resolves the skills directory from both locations automatically:

- the repo's `skills/` (when loaded from a git-backed spec)
- `~/.agents/skills/` (when installed with `python install.py`)

## Install

### Option A: global plugin file (recommended on Windows)

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

### Option B: git-backed plugin spec

Add the plugin to your `opencode.json` (global at
`~/.config/opencode/opencode.json` on Linux/macOS,
`%USERPROFILE%\.config\opencode\opencode.json` on Windows, or project-level):

```json
{
  "plugin": [
    "working-agreements@git+https://github.com/CarlosFerOrduna/agent-skills.git"
  ]
}
```

Note: git-backed specs are not documented in opencode's official plugin docs,
and some Windows builds have upstream installer issues with them. If the plugin
does not load, fall back to Option A.

Restart opencode after editing the config - configuration is loaded once at
startup.

## Usage

After restart, start a new conversation. The bootstrap is injected into the
first user message, which tells the model to load the `working-agreements`
skill before any response or action.

Use opencode's native `skill` tool to list and load skills:

- `skill` → list available skills
- `skill` with `name: working-agreements` → load the standards

## How it works

The plugin registers two hooks:

- **`config`**: pushes the resolved `skills/` directory into
  `config.skills.paths`.
- **`experimental.chat.messages.transform`**: injects the
  `using-working-agreements` bootstrap (read once and cached from
  `skills/using-working-agreements/SKILL.md` or
  `~/.agents/skills/using-working-agreements/SKILL.md`) into the first user
  message of each session.

The bootstrap instructs the model to load `working-agreements` before any
response, and maps skill actions to opencode's native tools.

## Troubleshooting

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i working-agreements`
2. Verify the plugin file is in `~/.config/opencode/plugins/` and is a fresh copy.
3. Confirm `python install.py` has been run so `~/.agents/skills/` exists.
4. Use `skill` tool to list what's discovered.