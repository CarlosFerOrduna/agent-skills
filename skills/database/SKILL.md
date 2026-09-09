---
name: database
version: 0.5.6
description: Database schema and migration conventions. Load when touching database schema, migrations, or ORM configuration.
---

# Database

## Migrations

- Use **versioned SQL migration files** for every schema change.
- Migration files are the **source of truth** for indexes, constraints, and schema evolution.
- Each migration describes a single logical change and uses a descriptive name.

## Naming

- Table names are **singular** and follow the engine's identifier style: **camelCase on MSSQL** (`userProfile`, quoting is never forced), **snake_case on Postgres** (`user_profile`, unquoted identifiers fold to lowercase so quoting is never forced).
- Column names follow the same engine style and always map to the camelCase property they represent.
- Where the domain allows it, prefer logical columns for state that must survive (soft-delete flags, audit timestamps such as `createdAt`/`created_at`, `updatedAt`/`updated_at`) over destructive changes.
- Anything outside this default is explicit in the migration SQL: on MSSQL a name that requires quoting or collides with a reserved word; on Postgres any name that is not snake_case (it becomes mandatory-quoted).

## ORM

- Never let the ORM mutate the database schema automatically.
- The ORM is a query and mapping tool, not a schema manager.
