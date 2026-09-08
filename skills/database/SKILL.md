---
name: database
version: 0.3.0
description: Database schema and migration conventions. Load when touching database schema, migrations, or ORM configuration.
---

# Database

## Migrations

- Use **versioned SQL migration files** for every schema change.
- Migration files are the **source of truth** for indexes, constraints, and schema evolution.
- Each migration describes a single logical change and uses a descriptive name.

## ORM

- Never let the ORM mutate the database schema automatically.
- The ORM is a query and mapping tool, not a schema manager.
