---
name: typeorm-mssql
version: 0.5.6
description: MSSQL-specific TypeORM conventions - camelCase identifiers, int identity primary keys, getutcdate timestamps, bit soft delete, and filtered unique indexes. Load alongside typeorm for SQL Server projects.
---

# TypeORM (MSSQL)

Load alongside `typeorm`. Covers SQL Server decisions only; the portable rules
live in the `typeorm` skill.

## Identifiers

- Tables and columns are singular camelCase: `@Entity('userProfile', { schema: 'dbo' })`, `@Column('varchar', { name: 'email', length: 50 })`. SQL Server is case-insensitive, so camelCase never forces quoting.
- FK columns are named `<entity>Id` (e.g. `createdByUserId`).

## Primary keys

- `int` identity: `@PrimaryGeneratedColumn({ type: 'int', name: 'id' })`.

## Logical columns

- Timestamps: `@Column('datetime', { name: 'createdAt', default: () => 'getutcdate()' })` (also `updatedAt`).
- Soft delete: `@Column('bit', { name: 'deleted', default: 0 })` plus `deletedAt` and optional `deletedBy`.

## Indexes

- Filtered unique indexes match the SQL exactly: `@Index('UQ_player_email', ['email'], { unique: true, where: 'email IS NOT NULL AND hasVerifiedEmail = 1 AND deleted = 0' })`.
