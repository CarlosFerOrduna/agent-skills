---
name: working-agreements
description: Always-on engineering contract for this project - language rules, security, architecture, package manager, timestamps, logging, and agent workflow, plus an index of the stack skills. Load at the start of any coding, review, or commit task; load the relevant stack skill on demand.
---

# Working Agreements

The always-on contract. This file stays small on purpose: the details live in
stack-specific skills that load on demand.

## Language

- Code in **English** with descriptive names: `getUserById`, not `getUsrById`.
- **JSDoc** in English; **inline comments** in Spanish.
- Comments are the last resort and explain **why**, never **what**.
- README and docs in English.

## Security

- Never commit `.env` files; keep secrets out of git via `.gitignore` and
  provide `.env.example` as the template.
- Never log: tokens, keys, passwords, decrypted config, or sensitive request
  bodies.
- Joi validation schemas are the source of truth for env vars, validation, and
  defaults; validate environment config at startup.
- Sensitive config may be encrypted at rest with AES-256-GCM (`CRYPT_KEY` as a
  base64 32-byte key). Never log decrypted values.

## Architecture

- The project follows a **microservices** architecture with explicit service
  boundaries; avoid unnecessary coupling.
- Prefer the smallest simple solution that satisfies the requirement. Reviews
  should push toward simplicity, not ceremony.

## Package manager

- Determine the package manager from the project **lockfile**, never from
  README or Dockerfiles.
- In a pnpm project never introduce `yarn.lock` or `package-lock.json`.

## Timestamps and logging

- All timestamps are UTC.
- Logs are written in English and never contain tokens, secrets, API keys,
  passwords, or decrypted configuration.

## Agent workflow

- Check `package.json` and the lockfile before assuming tooling is available.
- Run the project's lint command before committing.
- Verify tests according to the project's fork-specific test configuration.
- Keep shared values (enums, seeds, config) synchronized across their sources.
- Write the commit message only when asked, following the patterns in the
  `commit-conventions` skill.

## Stack skills

Load the matching skill when the task touches its area (they are on-demand, so
they only cost context when triggered):

- `commit-conventions` — Conventional Commits with a leading gitmoji.
- `nestjs-code-style` — TypeScript / NestJS style, naming, types, repositories.
- `database` — versioned SQL migrations and ORM schema discipline.
- `testing-standards` — Jest, unit and integration test layout.