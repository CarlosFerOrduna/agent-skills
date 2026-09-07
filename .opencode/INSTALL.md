# Installing the working-agreements plugin for opencode

## Overview

The plugin auto-injects the `using-working-agreements` bootstrap skill into the
first user message of each session, and auto-registers the repository's
`skills/` directory so opencode discovers the skills with no symlinks or manual
config edits.

## Install

Add the plugin to your `opencode.json` (global at `~/.config/opencode/opencode.json`
on Linux/macOS, `%USERPROFILE%\.config\opencode\opencode.json` on Windows, or
project-level):

```json
{
  "plugin": [
    "git+https://github.com/CarlosFerOrduna/agent-skills.git"
  ]
}
```

Note: use `@` to pin a specific commit/branch if desired, for example
`working-agreements@git+https://github.com/CarlosFerOrduna/agent-skills.git`.

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

- **`config`**: pushes the repo's `skills/` directory into
  `config.skills.paths` so opencode discovers both skills without symlinks.
- **`experimental.chat.messages.transform`**: injects the
  `using-working-agreements` bootstrap (read once and cached from
  `skills/using-working-agreements/SKILL.md`) into the first user message of
  each session.

The bootstrap instructs the model to load `working-agreements` before any
response, and maps skill actions to opencode's native tools.

## Windows notes

Some opencode builds have upstream issues installing git-backed plugins on
Windows. If the plugin fails to load:

1. Clone the repo and use `python install.py` (installs skills to
   `~/.agents/skills/`, which opencode reads natively).
2. Or add the skills directory manually to your `opencode.json`:

```json
{
  "skills": {
    "paths": ["/absolute/path/to/agent-skills/skills"]
  }
}
```

3. Or register the plugin from a local checkout:

```json
{
  "plugin": ["/absolute/path/to/agent-skills/.opencode/plugins/working-agreements.js"]
}
```