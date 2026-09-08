---
name: typeorm
version: 0.4.2
description: TypeORM entity, relation, repository, and configuration conventions. Load when designing entities, relations, queries, or TypeORM setup.
---

# TypeORM

## Entities

- Table names are singular camelCase matching the `database` skill: `@Entity('userProfile', { schema: 'dbo' })`.
- Every column has an explicit type as the first positional argument and an explicit camelCase `name:`: `@Column('varchar', { name: 'email', length: 50 })`.
- Primary keys follow the engine: MSSQL `@PrimaryGeneratedColumn({ type: 'int', name: 'id' })`; Postgres `@PrimaryGeneratedColumn('uuid')`.
- Logical columns are manual and live in SQL, not in the ORM runtime: timestamps with database defaults (`@Column('datetime', { name: 'createdAt', default: () => 'getutcdate()' })`), soft delete as a `deleted` bit plus `deletedAt` and optional `deletedBy`. Do not use `@CreateDateColumn` / `@UpdateDateColumn` / `@DeleteDateColumn`.
- `@CreateDateColumn` / `@UpdateDateColumn` / `@DeleteDateColumn` are acceptable in Postgres-native codebases that already follow that style; the migration files stay the source of truth either way.
- Relations are explicit: `@ManyToOne(() => UserEntity, user => user.users)` with `@JoinColumn([{ name: 'createdBy', referencedColumnName: 'id' }])`; FK columns are named `<entity>Id`.
- No `cascade` or lazy loading unless the workflow requires it; repeated references to the same entity get numbered inverse properties (`users`, `users2`).
- Declare filtered unique indexes exactly as the SQL does: `@Index('UQ_player_email', ['email'], { unique: true, where: 'email IS NOT NULL AND hasVerifiedEmail = 1 AND deleted = 0' })`.
- Constraint and index names are explicit (`PK_`, `UQ_`, `IX_`, `FK_`).
- Store TS enums as varchar with a literal default: `@Column('varchar', { name: 'kycStatus', length: 20, default: () => `'${KycStatus.NOT_STARTED}'` })`. Keep enum values synchronized across TS, SQL, and seeds.

## Repositories

- Register entities per feature module with `TypeOrmModule.forFeature([...])` and inject them directly: `@InjectRepository(Entity)`.
- A project may ship its own repository layer on top of TypeORM (base repositories or a query DSL). When it exists, use it where it expresses the requirement better or performs better than the vanilla API, and fall back to TypeORM directly where it does not fit. The two coexist per requirement.
- These standards never prescribe a particular proprietary layer; follow whatever the project already runs and keep new repository code inside that layer's conventions when it has them.
- Write a custom repository when there is real query logic. Extend `Repository<Entity>` with an explicit wiring constructor and expose intent-named methods (`findResumable`, `applyTerminal`) built on the project layer, `find*` options, or the query builder.

## Queries and transactions

- Prefer the `find*` options API; reserve `createQueryBuilder` for shapes it cannot express (raw projections, engine-specific output/returning).
- Paginate with `{ take, skip }`.
- Simple transactions use `dataSource.transaction(async (manager) => { ... })`; when several repositories must join one transaction, thread an explicit `QueryRunner` through the calls and run queries through `manager`.

## Configuration

- `synchronize: false` — TypeORM never mutates the schema.
- `autoLoadEntities: true` and no `entities:` / `migrations:` globs; migrations are versioned SQL applied by the project runner (see the `database` skill).
