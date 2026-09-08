# Agent Skills

One engineering contract for AI coding agents - editor-agnostic `SKILL.md` files
that follow the AGENTS.md / SKILL.md convention, with machine-enforced rules
where tooling can express them, distributed to whatever harness the team runs.

Installed skills live in the user-level `~/.agents/skills/` directory, which is read by:

- **Zed** (agent panel)
- **opencode**
- **Claude Code**
- Other tools following the same convention

## Skills

Split into a small always-on contract plus on-demand stack skills, so each
session only pays for the context it needs (progressive disclosure).

| Skill                | Layer     | Description                                                                                                                                                                                                         |
| -------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `working-agreements` | always-on | The engineering contract: language, security, architecture, package manager, timestamps/logging, and the agent workflow, plus the index of stack skills. Injected directly by the harness hooks into every session. |
| `commit-conventions` | on-demand | Conventional Commits with a leading gitmoji: valid types, scopes from paths, header ≤ 72 excluding the emoji, body and breaking-changes rules.                                                                      |
| `nestjs-code-style`  | on-demand | TypeScript / NestJS style: symbol/directory/file naming with responsibility suffixes, imports, types, constants, enums, and repository intent.                                                                      |
| `database`           | on-demand | Versioned SQL migrations and ORM schema discipline: migration files as the source of truth, ORM never mutates the schema.                                                                                           |
| `typeorm`            | on-demand | Portable TypeORM mapping and API conventions: explicit columns and names, relations, repositories, queries, `synchronize: false`. Engine decisions live in the per-engine skills below. |
| `typeorm-mssql`      | on-demand | MSSQL TypeORM conventions: camelCase identifiers, `int` identity keys, `getutcdate()` timestamps, `bit` soft delete, filtered unique indexes. |
| `typeorm-pg`         | on-demand | Postgres TypeORM conventions: snake_case identifiers (no forced quoting), `uuid` keys, `timestamptz` UTC timestamps, `boolean` soft delete, partial indexes. |
| `testing-standards`  | on-demand | Jest, unit tests alongside code, integration tests in `test/`, ephemeral tests removed when done.                                                                                                                   |

## Install the skills

The skills can be installed with the cross-platform installer (Python 3, no
dependencies):

```bash
python install.py            # install new and upgrade owned skills, skip foreign
python install.py --force    # also replace foreign skill directories
python install.py --prune    # also remove owned skills no longer shipped
```

This copies every skill in `skills/` to `~/.agents/skills/`.

Installership is tracked in `.agent-skills.json`: a directory the installer
recorded as its own is upgraded in place (an `UPDATE 'name' old -> new` line is
printed when the version differs). Directories installed before the manifest
existed are adopted on first run (an `ADOPT 'name' (version)` line; the `name:`
in their SKILL.md marks them as ours), so upgrading from a pre-manifest install
needs no flag. Foreign directories — something this installer never installed —
are skipped unless `--force` is passed.

`--prune` removes owned directories that no longer exist in `skills/`, plus the
legacy `using-working-agreements` bootstrap from pre-0.2.0 installs. It never
deletes skills it did not install, so foreign directories in `~/.agents/skills/`
(for example `commit-message`) are kept.

### Manual (any platform)

Copy each `skills/<name>/` folder into `~/.agents/skills/`:

```bash
cp -r skills/working-agreements skills/commit-conventions \
      skills/nestjs-code-style skills/database \
      skills/typeorm skills/typeorm-mssql skills/typeorm-pg \
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

- `check:commitlint` runs `scripts/smoke-commitlint.mjs`, which exercises the 6
  commitlint cases (valid, missing gitmoji, invalid type, multiple gitmojis,
  over-72 header, breaking) against a scratch repo.
- `check:skills` runs `scripts/check-skills.mjs` (Node only, no Python
  required), which fails on drift: skill frontmatter
  (name/version/description) vs. `package.json`, the Claude manifests
  (`plugin.json` / `marketplace.json`) versions, the contract stack index vs.
  the actual `skills/` dirs, README mentions, and stale references in the
  runtime surfaces.

Use `npm run check` rather than `pnpm check`: the repository ships no
dependencies, and pnpm's script runner runs an implicit install first, which
drops a stray `node_modules/` and `pnpm-lock.yaml` into the repo. The gate runs
on a bare Node install: `check:commitlint` provisions `@commitlint/cli` inside
a temporary scratch directory, so the repo itself keeps no `node_modules` and
no lockfile in sync.

## Anatomy

```
.
├── install.py                   # copies ./skills to ~/.agents/skills/ (--prune, manifest-tracked)
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
├── scripts/
│   ├── smoke-commitlint.mjs     # runs the 5 commitlint cases against a scratch repo
│   └── check-skills.mjs         # validates frontmatter, versions, index, README
├── skills/
│   ├── working-agreements/      # always-on contract (injected) + stack index
│   ├── commit-conventions/      # Conventional Commits + gitmoji
│   ├── nestjs-code-style/       # TS/NestJS style, naming, repositories
│   ├── database/                # migrations + ORM schema discipline
│   ├── typeorm/                 # TypeORM portable conventions (entities, repositories, config)
│   ├── typeorm-mssql/           # TypeORM for SQL Server (identifiers, keys, indexes)
│   ├── typeorm-pg/              # TypeORM for Postgres (identifiers, keys, indexes)
│   └── testing-standards/       # Jest, test layout
└── README.md
```

## Adding a new skill

1. Create `skills/<name>/SKILL.md`.
2. Add a YAML frontmatter block with `name`, `version`, and a `description` that tells the model when to invoke it.
3. Run `npm run check` to validate frontmatter, index, and README drift.
4. Run `python install.py` (or copy the folder manually).
5. Restart your editor.
