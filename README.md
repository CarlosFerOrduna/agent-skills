# Agent Skills

Editor-agnostic agent skills (SKILL.md) that follow the AGENTS.md / SKILL.md convention.

Installed skills live in the user-level `~/.agents/skills/` directory, which is read by:

- **Zed** (agent panel)
- **opencode**
- **Claude Code**
- Other tools following the same convention

## Skills

Split into a small always-on contract plus on-demand stack skills, so each
session only pays for the context it needs (progressive disclosure).

| Skill                      | Layer      | Description                                                                                                                                                                |
| -------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `working-agreements`       | always-on  | The engineering contract: language, security, architecture, package manager, timestamps/logging, and the agent workflow, plus the index of stack skills. Injected directly by the harness hooks into every session. |
| `commit-conventions`       | on-demand  | Conventional Commits with a leading gitmoji: valid types, scopes from paths, header ≤ 72 excluding the emoji, body and breaking-changes rules. |
| `nestjs-code-style`        | on-demand  | TypeScript / NestJS style: symbol/directory/file naming with responsibility suffixes, imports, types, constants, enums, and repository intent. |
| `database`                 | on-demand  | Versioned SQL migrations and ORM schema discipline: migration files as the source of truth, ORM never mutates the schema. |
| `testing-standards`        | on-demand  | Jest, unit tests alongside code, integration tests in `test/`, ephemeral tests removed when done. |

## Install the skills

The skills can be installed with the cross-platform installer (Python 3, no
dependencies):

```bash
python install.py            # skip existing skills
python install.py --force    # replace existing skills
```

This copies every skill in `skills/` to `~/.agents/skills/`.

### Manual (any platform)

Copy each `skills/<name>/` folder into `~/.agents/skills/`:

```bash
cp -r skills/working-agreements skills/commit-conventions \
      skills/nestjs-code-style skills/database \
      skills/testing-standards ~/.agents/skills/
```

After installing, restart your editor to pick up the new skills.

## Always-on bootstrap (optional per harness)

Standalone skills are loaded on demand. To make the agreements apply to every
session automatically, install the plugin for your harness:

### opencode

Recommended: add the git-backed spec to `opencode.json`:

```json
{
  "plugin": ["working-agreements@git+https://github.com/CarlosFerOrduna/agent-skills.git"]
}
```

The repo ships a `package.json`, so the plugin and its skills are installed
automatically on first startup.

To update after pulling a new version, clear the package cache once and
restart, because opencode caches git-installed packages by spec:

```powershell
Remove-Item "$env:USERPROFILE\.cache\opencode\packages" -Recurse -Force
```

Alternative: copy the plugin to the global plugins directory (auto-discovered):

```powershell
Copy-Item .opencode\plugins\working-agreements.js "$HOME\.config\opencode\plugins\"
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
`working-agreements` contract into every session (startup, `/clear`, and
compaction). The hook runs through a cross-platform polyglot wrapper so it works
on Windows and Unix without extra dependencies.

To update the installed plugin, reinstall it: `claude plugin install
working-agreements@agent-standards` (the version bump in the marketplace
triggers a fresh sync).

## Enforcement

Prompt-based standards decay. The [`enforcement/`](enforcement/README.md)
directory ships base configs for the consuming project repos to turn the
conventions into machine-checked gates: commitlint (gitmoji + header rules),
ESLint `unicorn/filename-case`, and gitleaks on pre-commit. The skills keep only
what tooling cannot express (repository intent, synchronized enums, Joi as the
source of truth).

## Verification

Run the same gates locally before every commit with npm (no GitHub access
required):

```
npm run check
```

- `check:commitlint` runs `scripts/smoke-commitlint.mjs`, which exercises the 5
  commitlint cases (valid, missing gitmoji, invalid type, over-72 header,
  breaking) against a scratch repo.
- `check:skills` runs `scripts/check-skills.py`, which fails on drift: skill
  frontmatter (name/version/description) vs. `package.json`, the contract stack
  index vs. the actual `skills/` dirs, README mentions, and stale references.

Use `npm run check` rather than `pnpm check`: this repository ships no
dependencies, and pnpm's script runner runs an implicit install first, which
drops a stray `node_modules/` and `pnpm-lock.yaml` into the repo.

`.github/workflows/ci.yml` mirrors these two checks in CI, so the same gate runs
on GitHub when Actions is available for the repository.

## Anatomy

```
.
├── install.py                   # copies ./skills to ~/.agents/skills/
├── package.json                 # npm metadata; required for git-backed plugin install
├── LICENSE                      # MIT
├── enforcement/
│   ├── README.md                # how to wire the base gates per project
│   ├── commitlint.config.cjs    # gitmoji + 11 types + header ≤72 (no emoji)
│   ├── eslint.config.mjs        # unicorn/filename-case and friends
│   ├── .gitleaks.toml           # secret scan baseline
│   └── .pre-commit-config.yaml  # gitleaks + hygiene hooks
├── .claude-plugin/
│   ├── plugin.json              # Claude Code plugin manifest
│   └── marketplace.json         # Claude marketplace (agent-standards)
├── hooks/
│   ├── hooks.json               # SessionStart hook definition
│   ├── run-hook.cmd             # cross-platform polyglot hook runner
│   └── session-start            # injects the contract into the context
├── .opencode/
│   ├── INSTALL.md               # opencode plugin installation guide
│   └── plugins/
│       └── working-agreements.js  # opencode plugin (bootstraps + registers skills)
├── .github/
│   └── workflows/
│       └── ci.yml               # commitlint smoke + skills consistency/drift
├── scripts/
│   ├── smoke-commitlint.mjs     # runs the 5 commitlint cases against a scratch repo
│   └── check-skills.py          # validates frontmatter, versions, index, README
├── skills/
│   ├── working-agreements/      # always-on contract (injected) + stack index
│   ├── commit-conventions/      # Conventional Commits + gitmoji
│   ├── nestjs-code-style/       # TS/NestJS style, naming, repositories
│   ├── database/                # migrations + ORM schema discipline
│   └── testing-standards/       # Jest, test layout
└── README.md
```

## Adding a new skill

1. Create `skills/<name>/SKILL.md`.
2. Add a YAML frontmatter block with `name`, `version`, and a `description` that tells the model when to invoke it.
3. Run `npm run check` to validate frontmatter, index, and README drift.
4. Run `python install.py` (or copy the folder manually).
5. Restart your editor.
