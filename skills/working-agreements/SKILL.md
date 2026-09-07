---
name: working-agreements
description: Project-wide working agreements and engineering standards for TypeScript / NestJS microservices — language rules, commit conventions with gitmoji, code style, naming conventions, security, database migrations, configuration, testing, and agent workflow. Use this skill at the start of any coding, review, or commit task in repos that follow these standards.
---

# Agent Rules — Proyecto Default

## Language

### Code

- All code must be written in **English**:
  - Variables
  - Functions
  - Classes
  - Parameters
  - Types
  - Interfaces
  - Enums
  - Constants

- Use descriptive English names without abbreviations.
- Prefer `getUserById` over `getUsrById`.

### Comments

- **JSDoc** must be written in **English**.
- **Inline comments** must be written in **Spanish**.
- Code should be self-explanatory whenever reasonably possible.
- Comments are the **last resort**, only when readability is insufficient to explain **why** something is done.
- Do not document **what** the code does when the code already makes it clear.
- Prefer comments explaining decisions, constraints, trade-offs, or non-obvious behavior.

## Commits

- Commit messages must always be written in **English**.
- Use **Conventional Commits** with a leading gitmoji.

Format:

```text
<emoji> <type>(<scope>): <subject>
```

- `type` must be one of:
  - `feat`
  - `fix`
  - `docs`
  - `style`
  - `refactor`
  - `perf`
  - `test`
  - `build`
  - `ci`
  - `chore`
  - `revert`

- Use the most specific gitmoji for the change:

| Gitmoji | Type                        | Meaning                           |
| ------- | --------------------------- | --------------------------------- |
| ✨      | `feat`                      | New feature                       |
| 🐛      | `fix`                       | Bug fix                           |
| 🚑️      | `critical hotfix`           | Critical hotfix                   |
| 🔒️      | `security fix or hardening` | Security fix or hardening         |
| 📝      | `docs`                      | Documentation                     |
| 🎨      | `style`                     | Formatting/style, no logic change |
| ♻️      | `refactor`                  | Refactoring                       |
| ⚡️      | `perf`                      | Performance improvement           |
| ✅      | `test`                      | Tests                             |
| 👷      | `build`                     | Build changes                     |
| 💚      | `ci`                        | CI changes                        |
| 🔧      | `chore`                     | Chore/configuration               |
| ⏪️      | `revert`                    | Revert                            |
| ⬆️      | —                           | Dependency upgrade                |
| ⬇️      | —                           | Dependency downgrade              |
| ➕      | —                           | Add dependency                    |
| ➖      | —                           | Remove dependency                 |
| 🔥      | —                           | Remove code or files              |
| 🗃️      | —                           | Database schema/migration         |
| 🚀      | —                           | Deploy/release                    |

### Commit scope

- The `scope` must be based on the affected file **PATH**.
- Use the service directory or a module inside it.
- Never derive the scope from code identifiers, class names, or symbols.
- Prefer short, modular scopes derived from the path.
- Omit the scope if including it would make the header exceed 72 characters.

### Commit subject

- Use imperative mood.
- Start with lowercase.
- No trailing punctuation.
- Maximum **72 characters for the entire header**, including the gitmoji.
- Aim for **60 characters or fewer**.
- If the header is too long:
  1. Tighten the subject.
  2. Shorten the scope.
  3. Drop the scope.
  4. Move useful context into the body.

### Commit body

- Omit the body when the subject accurately expresses the change.
- Use a body only for useful context:
  - Why the change was made.
  - Non-obvious design decisions.
  - Context a reviewer needs.

- Do not repeat the subject.
- Do not describe the raw diff line by line.
- Separate subject and body with a blank line.

### Breaking changes

- Add `!` after the type/scope.
- Add a `BREAKING CHANGE:` footer explaining the impact.

### Other rules

- Never reference tickets, issues, or PR numbers.
- Only return the commit message when specifically asked to generate a commit message.

Example:

```text
✨ feat(auth): add JWT refresh-token rotation
```

## Documentation

- README files must be written in **English**.
- Documentation files must be written in **English**.

# Code Style — TypeScript / NestJS

## Tools

- Use **ESLint** for linting.
- Use **Prettier** for formatting.
- Run linting before committing:
  - `npm run lint`
  - Or the equivalent project-specific command.

## Principles

Always apply:

- **SOLID**
- **DRY**
- **KISS**
- **Clean Architecture**
- **Clean Code**

Seek excellence in every design decision.

Prefer simple, explicit, maintainable solutions over unnecessary abstractions or complexity.

## Naming Conventions

### Symbols

- **Functions and variables:** `camelCase`
- **Classes, components, types, interfaces, enums:** `PascalCase`
- Use descriptive names in English.
- Avoid unnecessary abbreviations.

### Directories

- Use lowercase `kebab-case` for directory names.
- Directories should represent architectural responsibility when applicable.

Examples:

```text
constants/
controllers/
decorators/
dto/
entities/
filters/
guards/
jobs/
repositories/
services/
strategies/
types/
utils/
```

### Files

- Use lowercase `kebab-case`.
- Add a **responsibility suffix** when applicable.
- File names must clearly communicate the responsibility of the file.
- Follow the existing naming patterns of the surrounding module.

Common suffixes:

- `.controller.ts` — HTTP/NestJS controllers
- `.service.ts` — application/domain services
- `.repository.ts` — repositories
- `.guard.ts` — NestJS guards
- `.filter.ts` — exception filters
- `.decorator.ts` — decorators
- `.dto.ts` — data transfer objects
- `.entity.ts` — persistence entities
- `.strategy.ts` — authentication/passport strategies
- `.processor.ts` — queue/job processors
- `.scheduler.ts` — scheduled/background services
- `.constant.ts` — constants
- `.util.ts` — utility functions
- `.module.ts` — NestJS modules
- `.spec.ts` — tests
- `index.ts` — barrel exports

Examples:

```text
user-profile.controller.ts
orders.controller.ts
user-profile.service.ts
orders.service.ts
order.repository.ts
conditional-access.guard.ts
jwt-auth.guard.ts
public-route.guard.ts
not-found-exception.filter.ts
current-user.decorator.ts
pagination.decorator.ts
create-user.dto.ts
update-password.dto.ts
user.entity.ts
jwt-auth.strategy.ts
inventory-sync.processor.ts
daily-digest-scheduler.service.ts
http-headers.constant.ts
string-utils.util.ts
auth.module.ts
users.module.ts
app.module.ts
```

- Use the most specific responsibility suffix that applies.
- Do not encode implementation details, class names, or arbitrary abbreviations into filenames.
- Prefer names that remain meaningful when viewed without opening the file.

## General Code Conventions

- Functions should have a clear and well-defined responsibility.
- Review existing components and modules before implementing new functionality.
- Follow established project patterns whenever possible.
- Do not assume a library or dependency is available.
- Check `package.json` before using a dependency.
- Do not introduce dependencies without a clear reason.
- Do not use emojis inside source-code files.

## Imports

- Prefer relative imports.

Example:

```typescript
import { x } from "../module";
```

# Security

- **Never expose or log secrets, keys, or tokens.**
- Never log sensitive data.
- Never log decrypted secrets or sensitive decrypted configuration.
- `.env` files must never be committed.
- Use `.gitignore` to exclude environment files and secrets.
- Follow security best practices appropriate for the framework and application architecture.

# Architecture

- The project follows a **microservices architecture**.
- Keep service boundaries explicit.
- Avoid unnecessary coupling between services.
- Follow **Clean Architecture** principles when designing or modifying application components.

# Package Manager

- **pnpm** is the default package manager.
- Verify the actual package manager by checking the project's **lockfile**.
- Do not use the README or Dockerfiles to determine the package manager.
- In a pnpm project, never introduce:
  - `yarn.lock`
  - `package-lock.json`

- Preserve the existing package manager and lockfile strategy.

# Database

- Schema changes must be managed with the project's established migration strategy.
- Do not let an ORM mutate the schema automatically when the project uses migrations.
- Prefer versioned, descriptive migration names.

# Configuration

- Joi validation schemas are the source of truth for:
  - Environment variables
  - Validation
  - Defaults

- Do not duplicate configuration defaults or validation rules unnecessarily.
- Environment configuration should be validated at startup.

## Sensitive Configuration

- Sensitive configuration may be stored encrypted at rest (e.g. **AES-256-GCM**).
- Never log decrypted configuration values.
- Never expose decrypted secrets through APIs, logs, errors, or debugging output.

# TypeScript Types

- Place `type`, `interface`, and `enum` definitions inside appropriate `types/` directories.
- Do not colocate shared types with the classes that consume them when the project provides a `types/` location.

# Enums

When a value exists across multiple representations (TypeScript, database, seeds, API contracts, external vocabularies), keep all representations **synchronized**.

When changing such a value, update all sources together.

# Constants

- Group related constants together.
- Prefer:
  - Classes with static members.
  - `as const` objects with a derived type.

- Avoid unrelated standalone exports when constants logically belong to the same domain.

# Repositories

- Repository methods must express **business intent**.
- Prefer methods with intent-revealing names over generic ORM operations.
- Avoid exposing generic ORM-oriented operations as the primary repository API.
- Repositories should hide persistence implementation details from the application/domain layer.

# Timestamps

- All timestamps must use **UTC**.
- Do not introduce local-time timestamps into persisted application data.

# Logging

- Logs must always be written in **English**.
- Never log:
  - Tokens
  - Secrets
  - API keys
  - Passwords
  - Decrypted configuration
  - Sensitive request/response bodies

- Be especially careful with authentication, identity, payment, and other security-sensitive flows.

# Environment

- `.env` files must never be committed.
- Use `.env.example` as the template for required environment variables.
- Local/development secret files such as `.env.*` must be ignored through `.gitignore`.
- Never commit real credentials or secrets.

# Testing

## Framework

- The testing framework is **Jest**.
- Do not assume the testing configuration.
- Check `package.json` and/or the project README before introducing or modifying tests.

## Unit Tests

- Unit tests must live alongside the code they test.

Example:

```text
user.service.ts
user.service.spec.ts
```

## Integration Tests

- Integration tests must live in the separate:

```text
test/
```

directory.

## Ephemeral Tests

- Agents may create temporary test files to validate a hypothesis or implementation.
- Ephemeral test files must be removed when the plan of work is complete.
- Do not leave temporary/debugging tests in the repository unless intentionally part of the final test suite.

# Agent Workflow

When modifying the project:

1. Inspect the existing project structure and patterns before introducing new code.
2. Check `package.json` before assuming dependencies or tooling are available.
3. Check the lockfile to determine the package manager.
4. Follow existing architectural conventions unless there is a clear reason to change them.
5. Prefer the smallest simple solution that satisfies the requirement.
6. Keep code self-documenting and avoid unnecessary comments.
7. Ensure security-sensitive information is never exposed.
8. Run the project's linting command before committing.
9. Verify tests according to the project's existing Jest configuration.
10. Remove ephemeral test/debug files created during the task.
11. Keep any duplicated value representations (enum lists, seeds, config) synchronized across their sources.
12. Handle database schema changes through the project's established migration strategy rather than ORM schema sync.
