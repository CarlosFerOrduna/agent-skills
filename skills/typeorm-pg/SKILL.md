---
name: typeorm-pg
version: 0.5.0
description: Postgres-specific TypeORM conventions - snake_case identifiers (no forced quoting), uuid primary keys, timestamptz UTC timestamps, boolean soft delete, and partial indexes. Load alongside typeorm for Postgres projects.
---

# TypeORM (PostgreSQL)

Load alongside `typeorm`. Covers Postgres decisions only; the portable rules
live in the `typeorm` skill.

## Identifiers

- Tables and columns are snake_case: `@Entity('user_profile')`, `@Column('varchar', { name: 'email', length: 50 })`. Postgres folds unquoted identifiers to lowercase, so snake_case keeps migrations, psql, and `\d` output free of mandatory quoting.
- Any name outside snake_case requires quoting in every hand-written migration and query, so it is always explicit.
- FK columns are named `<entity>_id` (e.g. `created_by_user_id`).
- Constraint and index names are lowercase (Postgres folds them anyway).

## Primary keys

- `uuid` with a database default: `@PrimaryGeneratedColumn('uuid')` plus `default: () => 'gen_random_uuid()'` when the migration column carries it.

## Logical columns

- Timestamps: `@Column('timestamptz', { name: 'created_at', default: () => 'now()' })` (also `updated_at`). All timestamps are UTC.
- Soft delete: `@Column('boolean', { name: 'deleted', default: false })` plus `deleted_at` and optional `deleted_by`.
- When existing entities already use `@CreateDateColumn` / `@UpdateDateColumn` / `@DeleteDateColumn`, keep that style; do not introduce them where they are not already present. The migration files stay the source of truth either way.

## Indexes

- Partial indexes match the SQL exactly: `@Index('uq_player_email', ['email'], { unique: true, where: 'email IS NOT NULL AND has_verified_email AND NOT deleted' })`.