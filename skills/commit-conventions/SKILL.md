---
name: commit-conventions
description: Conventional Commits with a leading gitmoji - valid types, scope derived from file paths, header at most 72 characters excluding the emoji, subject/body/breaking-changes rules. Load when writing, reviewing, or generating a commit message.
---

# Commit Conventions

Commit messages are written in **English** using **Conventional Commits** with a
leading gitmoji:

```text
<emoji> <type>(<scope>): <subject>
```

## Valid types

The `type` must be one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`,
`test`, `build`, `ci`, `chore`, `revert`.

The emoji identifies the change, the type must **always** be valid. Critical
hotfixes and security fixes are still a `fix`, never a new type:

| Gitmoji | Type      | Meaning                           |
| ------- | --------- | --------------------------------- |
| ✨      | `feat`    | New feature                       |
| 🐛      | `fix`     | Bug fix                           |
| 🚑️      | `fix`     | Critical hotfix                   |
| 🔒️      | `fix`     | Security fix or hardening         |
| 📝      | `docs`    | Documentation                     |
| 🎨      | `style`   | Formatting/style, no logic change |
| ♻️      | `refactor`| Refactoring                       |
| ⚡️      | `perf`    | Performance improvement           |
| ✅      | `test`    | Tests                             |
| 👷      | `build`   | Build changes                     |
| 💚      | `ci`      | CI changes                        |
| 🔧      | `chore`   | Chore/configuration               |
| ⏪️      | `revert`  | Revert                            |
| ⬆️      | `chore`   | Dependency upgrade                |
| ⬇️      | `chore`   | Dependency downgrade              |
| ➕      | `chore`   | Add dependency                    |
| ➖      | `chore`   | Remove dependency                 |
| 🔥      | `chore`   | Remove code or files              |
| 🗃️      | `chore`   | Database schema/migration         |
| 🚀      | `ci`      | Deploy/release                    |

## Scope

- The `scope` is based on the affected file **PATH**: the service directory or a
  module inside it, never a class name or symbol.
- Prefer short scopes: `credentials`, `crypto`, `auth`, `identity` for
  `identity-orchestrator`, `assets` for `asset-gateway`.
- Omit the scope when it adds no signal or the header would exceed the limit.

## Header length

- Maximum **72 characters excluding the emoji**. Some gitmojis carry U+FE0F
  (multiple code points), so counting the emoji would make the limit unstable;
  exclude it.
- Aim for **60 characters or fewer**.
- Subject: imperative mood, starts lowercase, no trailing punctuation.
- If the header is too long: tighten the subject, shorten the scope, drop the
  scope, then move useful context into the body.

## Body

- Omit the body when the subject expresses the change.
- Use it only for useful context: why the change was made, non-obvious design
  decisions, reviewer context.
- Do not repeat the subject or describe the diff line by line.
- Separate subject and body with a blank line.

## Breaking changes

- Add `!` after type/scope and a `BREAKING CHANGE:` footer explaining the
  impact.

## Other rules

- Never reference tickets, issues, or PR numbers.
- Only return a commit message when asked to generate one.

Example:

```text
✨ feat(auth): add JWT refresh-token rotation
```