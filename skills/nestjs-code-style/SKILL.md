---
name: nestjs-code-style
version: 0.5.5
description: TypeScript / NestJS code style - symbol, directory, and file naming with responsibility suffixes, general code conventions, import style, type/enum/constant placement, and repository methods that express business intent. Load when writing or reviewing TypeScript / NestJS code.
---

# NestJS Code Style

## Tools

- ESLint for linting, Prettier for formatting.
- Run linting before committing (`npm run lint` or the project equivalent).

## Principles

- Prefer simple, explicit, maintainable solutions over unnecessary abstractions.
- Prefer the simplest structure that satisfies the requirement.

## Naming conventions

### Symbols

- Functions and variables: `camelCase`.
- Classes, components, types, interfaces, enums: `PascalCase`.
- Descriptive names in English; avoid unnecessary abbreviations.

### Directories

- Lowercase `kebab-case`; directories represent architectural responsibility
  when applicable: `constants/`, `controllers/`, `decorators/`, `dto/`,
  `entities/`, `filters/`, `guards/`, `jobs/`, `repositories/`, `services/`,
  `strategies/`, `types/`, `utils/`.

### Files

- Lowercase `kebab-case` with the most specific **responsibility suffix**:
  `.controller.ts`, `.service.ts`, `.repository.ts`, `.guard.ts`, `.filter.ts`,
  `.decorator.ts`, `.dto.ts`, `.entity.ts`, `.strategy.ts`, `.processor.ts`,
  `.scheduler.ts`, `.constant.ts`, `.util.ts`, `.module.ts`, `.spec.ts`, and
  `index.ts` for barrels.
- Examples: `user-profile.controller.ts`, `orders.service.ts`,
  `create-user.dto.ts`, `jwt-auth.strategy.ts`, `app.module.ts`.
- File names must remain meaningful without opening the file; do not encode
  implementation details or arbitrary abbreviations.

## General conventions

- Functions have a clear, well-defined responsibility.
- Review existing components and modules before implementing new functionality;
  follow established patterns.
- Do not assume a library is available: check `package.json` first, and do not
  add dependencies without a clear reason.
- No emojis inside source-code files.

## Imports

- Use **relative imports within a module** (`../module`, `../../feature/user`) so
  each file is self-contained and moves with its module.
- Use the project's **path alias** (`@/`, `@app/`) for anything that crosses a
  service or module boundary, where a relative path would be deep and fragile
  (`../../../shared`).

## TypeScript types

- Place `type`, `interface`, and `enum` definitions inside the appropriate
  `types/` directories.
- Do not colocate shared types with the classes that consume them when a
  `types/` location exists.

## Enums

- When a value exists across multiple sources (TypeScript, database, seeds,
  contracts), keep all representations **synchronized**: update all sources in
  the same change.

## Constants

- Group related constants together using a class with static members or an
  `as const` object with a derived type.
- Avoid unrelated standalone exports when constants belong to the same domain.

## Repositories

- Repository methods express **business intent**, not the generic ORM API:
  prefer `findResumable`, `applyTerminal` over `findOneWhere...`.
- Repositories hide persistence implementation details from the application and
  domain layers.
