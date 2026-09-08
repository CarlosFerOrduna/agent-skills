---
name: database
version: 0.4.0
description: Database schema and migration conventions. Load when touching database schema, migrations, or ORM configuration.
---

# Database

## Migrations

- Use **versioned SQL migration files** for every schema change.
- Migration files are the **source of truth** for indexes, constraints, and schema evolution.
- Each migration describes a single logical change and uses a descriptive name.

## Naming

- Table names are **singular** and **camelCase**, matching the entity or class they map (e.g. `userProfile`, not `user_profiles`).
- Column names are **camelCase**, matching the mapped property name.
- Where the domain allows it, prefer logical columns for state that must survive (soft-delete flags, audit timestamps such as `createdAt`, `updatedAt`, `deletedAt`) over destructive changes.
- Anything outside this default (e.g. a name that requires quoting or collides with a reserved word) is explicit in the migration SQL.

## ORM

- Never let the ORM mutate the database schema automatically.
- The ORM is a query and mapping tool, not a schema manager.
