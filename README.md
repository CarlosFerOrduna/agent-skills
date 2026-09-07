# Agent Skills

Editor-agnostic agent skills (SKILL.md) that follow the AGENTS.md / SKILL.md convention.

Installed skills live in the user-level `~/.agents/skills/` directory, which is read by:

- **Zed** (agent panel)
- **opencode**
- **Claude Code**
- Other tools following the same convention

## Skills

| Skill                      | Description                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `working-agreements`       | Project-wide engineering standards: language, commits (Conventional Commits + gitmoji), code style, naming, security, migrations, configuration, testing, and the agent workflow. |
| `using-working-agreements` | Bootstrap skill: instructs the agent to always load `working-agreements` at the start of any conversation or task.                                                                |

## Install the skills

The `working-agreements` and `using-working-agreements` skills can be installed
with the cross-platform installer (Python 3, no dependencies):

```bash
python install.py
```

This copies every skill in `skills/` to `~/.agents/skills/`.

### Manual (any platform)

Copy each `skills/<name>/` folder into `~/.agents/skills/`:

```bash
cp -r skills/working-agreements skills/using-working-agreements ~/.agents/skills/
```

After installing, restart your editor to pick up the new skills.

## Always-on bootstrap (optional per harness)

Standalone skills are loaded on demand. To make the agreements apply to every
session automatically, install the plugin for your harness:

### opencode

Recommended on Windows: copy the plugin to the global plugins directory
(auto-discovered, no config edit):

```powershell
Copy-Item .opencode\plugins\working-agreements.js "$HOME\.config\opencode\plugins\"
```

Alternatively, add the git-backed spec to `opencode.json`:

```json
{
  "plugin": ["working-agreements@git+https://github.com/CarlosFerOrduna/agent-skills.git"]
}
```

See [`.opencode/INSTALL.md`](.opencode/INSTALL.md) for details and troubleshooting.

### Claude Code

Add the marketplace and install the plugin (the repo is both the marketplace
and the plugin - the marketplace name is `agent-standards`):

```bash
/plugin marketplace add https://github.com/CarlosFerOrduna/agent-skills
/plugin install working-agreements@agent-standards
```

Same commands from the shell (non-interactive, user scope):

```bash
claude plugin marketplace add https://github.com/CarlosFerOrduna/agent-skills
claude plugin install working-agreements@agent-standards
```

The plugin registers a `SessionStart` hook that injects the
`using-working-agreements` bootstrap into every session (startup, `/clear`, and
compaction). The hook runs through a cross-platform polyglot wrapper so it works
on Windows and Unix without extra dependencies.

## Anatomy

```
.
├── install.py                   # copies ./skills to ~/.agents/skills/
├── .claude-plugin/
│   └── plugin.json              # Claude Code plugin manifest
├── hooks/
│   ├── hooks.json               # SessionStart hook definition
│   ├── run-hook.cmd             # cross-platform polyglot hook runner
│   └── session-start            # injects the bootstrap skill into the context
├── .opencode/
│   ├── INSTALL.md               # opencode plugin installation guide
│   └── plugins/
│       └── working-agreements.js  # opencode plugin (bootstraps + registers skills)
├── skills/
│   ├── working-agreements/
│   │   └── SKILL.md             # the standards
│   └── using-working-agreements/
│       └── SKILL.md             # the always-load bootstrap skill
└── README.md
```

## Adding a new skill

1. Create `skills/<name>/SKILL.md`.
2. Add a YAML frontmatter block with `name` and a `description` that tells the model when to invoke it.
3. Run `python install.py` (or copy the folder manually).
4. Restart your editor.
