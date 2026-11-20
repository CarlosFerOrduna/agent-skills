---
name: working-agreements
version: 0.5.13
description: Always-on engineering contract for this project - language rules, security, architecture, package manager, timestamps, logging, and agent workflow, plus an index of the stack skills. Load at the start of any coding, review, or commit task; load the relevant stack skill on demand.
---

# Working Agreements

The always-on engineering contract. When the harness wrapper is installed
(Claude Code plugin or opencode plugin), this file is injected at the start of
every session (startup, `/clear`, and compaction); on a bare `~/.agents/skills`
install, load it with the `skill` tool or read it directly from disk. It stays
small on purpose: the details live in stack-specific skills that load on
demand.

This contract states the default rules for the repo(s) it governs. A project
layer (project-level skill or `AGENTS.md`) may tighten them; if a rule
conflicts with an explicit user instruction, the user instruction wins.

## Language

- Talk to the user in **Rioplatense Spanish** (voseo: "vos tenés", "fijate",
  "dale"): questions, summaries, proposals, and reports. What gets written
  stays in the language the rules below set (code, JSDoc, docs, logs, and
  commit messages in English).
- Code in **English** with descriptive names: `getUserById`, not `getUsrById`.
- Make code **descriptive and readable on its own**: names carry intent, so a
  comment is the last resort, added only when the code cannot explain the
  **why** on its own.
- **JSDoc/TSDoc** always in **English**, regardless of the surrounding prose; it is
  API surface, not local note-taking.
- **Inline comments** in **Spanish** only when they explain the non-obvious
  **why** and never restate the **what** the code already says. This rule
  applies only to JavaScript/TypeScript inline comments (`//`, `/* */`); for
  other languages (Bash/Shell `#`, Python `#`, Makefiles, YAML `#`, SQL `--`,
  etc.), comments are in **English**.
- README and docs in English.

## Documentation

- Update `docs/*.md` (flow, decisions, history) in the same change as the code
  they describe, never in a follow-up.
- JSDoc and `docs/*.md` complement each other: JSDoc documents a symbol's
  contract, `docs/*.md` the flow and the decisions across symbols. Do not
  duplicate one in the other.
- Title doc sections by topic. Never cite ticket ids (`PP-42`) or plan step
  numbers in docs: they mean nothing once the ticket or the plan is gone.

## Security

- Never commit `.env` files; keep secrets out of git via `.gitignore` and
  provide `.env.example` as the template.
- Never operate on a database that is not the repo's local/Docker one. Dev or
  staging credentials visible in `.env` or config are read-only information:
  running migrations or writing to those environments is off limits, even when
  reachable.
- Never log: tokens, keys, passwords, decrypted config, or sensitive request
  bodies.
- Joi validation schemas are the source of truth for env vars, validation, and
  defaults; validate environment config at startup.
- Sensitive config may be encrypted at rest with AES-256-GCM (`CRYPT_KEY` as a
  base64 32-byte key). Never log decrypted values.

## Architecture

- The default assumption is a **microservices** architecture with explicit
  service boundaries; avoid unnecessary coupling. A project may override this
  layer.
- Prefer the smallest simple solution that satisfies the requirement. Reviews
  should push toward simplicity, not ceremony.
- Return object literals multiline, one property per line with a trailing
  comma when the language supports it, even when the object has a single
  property: diffs stay small and later additions stay localized.

## Package manager

- Determine the package manager from the project **lockfile**, never from
  README or Dockerfiles.
- In a pnpm project never introduce `yarn.lock` or `package-lock.json`.
- Docs show commands with `npm` (`npm install`, `npm run build`) even when the
  project runs on another manager, so readers are not tied to one; execution
  still follows the lockfile.

## Timestamps and logging

- All timestamps are UTC.
- Logs are written in English and never contain tokens, secrets, API keys,
  passwords, or decrypted configuration.

## Agent workflow

- Check `package.json` and the lockfile before assuming tooling is available.
- Lint only the session's changed files (`git diff --name-only` plus untracked),
  never the whole project. Prefer the per-file lint command (`npx eslint <files>`
  and similar) when the repo only exposes a whole-project script; report issues
  in the touched scope only, and do not let untouched files add noise.
- Run the project's full build and unit tests after finishing an
  implementation; do not ask for permission first, just report the result.
- Verify tests according to the project's fork-specific test configuration.
- Keep shared values (enums, seeds, config) synchronized across their sources.
- At each natural commit point (a checkpoint reached or the requirement
  finished), pause and run the `commit` skill: show each repo's diff, propose
  the message, and wait. OpenCode and Claude Code expose it as `/commit`; Zed
  as the `commit` skill.
- Only an explicit order approves an action. A question ("¿estamos para
  commitear?") gets an answer and nothing else.
- Never stage or `git commit` without that approval. Never propose or run
  `git push`: the user pushes when the whole work is done (`/push` runs only
  when the user invokes it).
- External services (Plane and other trackers, Postman, deploys): reading is
  free; writing requires an explicit ask each time. Any text to publish
  (comment, description) is shown as a draft and waits for approval, like a
  commit message.
- Design discussions: conclusion first, one line per decision, one
  recommendation. Skip long pros/cons lists unless asked.
- Never self-arm autonomous background loops/wakeups; only run them when the
  user explicitly invokes the loop command.
- Never include `Co-Authored-By:` trailers in commit messages.

## Stack skills

Load the matching skill when the task touches its area (they are on-demand, so
they only cost context when triggered). Use the `skill` tool to load them; if
skills are not available in the current harness, read the `SKILL.md` files
directly from `~/.agents/skills/` or the plugin/marketplace skills directory
and apply them as if they were a direct project instruction:

- `commit-conventions` — Conventional Commits with a leading gitmoji.
- `commit` — the commit/push handshake: propose, present, and approve.
- `nestjs-code-style` — TypeScript / NestJS style, naming, types, repositories.
- `database` — versioned SQL migrations and ORM schema discipline.
- `typeorm` — TypeORM entity, relation, repository, query, and configuration conventions.
- `typeorm-mssql` — MSSQL-specific TypeORM conventions (identifiers, keys, filtered indexes).
- `typeorm-pg` — Postgres-specific TypeORM conventions (identifiers, keys, partial indexes).
- `testing-standards` — Jest, unit and integration test layout.
- `code-intelligence` — codebase search and graph navigation (ripgrep, ast-grep, graphify).

## Contract version

This contract is **v0.5.13**. When you need to know or report the version of the
standards in effect (for example, when collaborators on different installs
produce divergent commits), state it.
