---
name: testing-standards
version: 0.5.16
description: Testing conventions - Jest and the testing honeycomb - service tests first (test/*.e2e-spec.ts against real docker-compose infra, real auth, nock for external services), *.spec.ts beside the class only for isolated logic, no integrated tests, and ephemeral agent tests removed when the work is done. Load when writing or modifying tests.
---

# Testing Standards

## Framework

- The testing framework is **Jest**.
- Do not assume the testing configuration: check `package.json`, the Jest
  config (`jest` key or `jest.config.*`), and `test/jest-e2e.json` before
  introducing or modifying tests.

## Strategy

- Shape the suite as a **honeycomb**, not a pyramid: a microservice's risk
  sits at its boundaries, so most tests are **service tests**.
- **Service tests** exercise one service in isolation from its edges (HTTP
  endpoints, Kafka and BullMQ consumers) with its internal layers real:
  controllers, services, repositories, and the database.
- **Implementation detail tests** (unit) only for isolated logic with its own
  complexity: parsers, decision tables, calculations. Do not unit-test wiring
  that a service test already covers.
- Avoid **integrated tests**: tests that pass or fail depending on another
  real service. Cover the contract with other services through shared fixtures
  (the same request, response, or message samples on both sides) or contract
  tests.
- Cover **features, not functions**: each test states a behavior a caller can
  observe.
- Write the tests while writing the code, never as a follow-up.

## Layout

- **Implementation detail tests**: `<name>.spec.ts` beside the class they
  cover (`src/orders/utils/order-fee.util.ts` + `order-fee.util.spec.ts`). No
  I/O: `npm test` runs only these and passes with no infrastructure running.
- **Service tests**: `test/<feature>.e2e-spec.ts`, run by `npm run test:e2e`.
- The `e2e` suffix is Nest's naming only. In honeycomb terms these are
  integration tests of one isolated service, not end-to-end tests across
  services.
- Any test that needs a database, Redis, or Kafka lives in `test/`, never in a
  `.spec.ts`.
- In an existing project with another layout, do not move tests unless asked:
  propose the migration.

## Implementation detail tests

- Provide every dependency of the subject explicitly through DI with
  `useValue`, typed as `jest.Mocked<T>` or checked with `satisfies`.
- No `useMocker` auto-mocks: a dependency the test does not declare is a
  dependency the reader cannot see.

  Avoid:

  ```ts
  const moduleRef = await Test.createTestingModule({ providers: [OrderPricingService] })
    .useMocker(() => ({}))
    .compile();
  ```

  Keep:

  ```ts
  const ratesRepository: jest.Mocked<Pick<RatesRepository, 'findCurrentRate'>> = {
    findCurrentRate: jest.fn(),
  };

  const moduleRef = await Test.createTestingModule({
    providers: [
      OrderPricingService,
      {
        provide: RatesRepository,
        useValue: ratesRepository,
      },
    ],
  }).compile();
  ```

## Service tests

### App under test

- Boot the whole app in the test process:
  `Test.createTestingModule({ imports: [AppModule] })`, `createNestApplication()`,
  the same global configuration `main.ts` applies (pipes, filters, prefix)
  through a shared function, and `app.init()`.
- For Kafka consumers, also `app.connectMicroservice()` and
  `app.startAllMicroservices()`; BullMQ workers start with `app.init()`.
- Call the endpoints with supertest on `app.getHttpServer()`, and
  `await app.close()` in `afterAll`.
- Never override the service's own providers. `overrideProvider` is only for
  an external dependency that neither nock nor the test compose can reach (a
  non-HTTP SDK).

### Infrastructure

- Run the infrastructure from a dedicated `docker-compose.test.yml` with its
  own project name (`docker compose -p <service>-test`), on ports different
  from dev, with only the services the tests use.
- The app reads its test configuration from a test env file (`.env.test`)
  pointing at those ports.
- Jest's `globalSetup` starts the compose and runs the migrations with the same
  mechanism production uses, never ORM `synchronize`.
- `globalTeardown` stops the compose only in CI; locally it stays up for fast
  reruns.
- Use the production database engine tuned for speed: durability off
  (Postgres: `fsync=off`, `synchronous_commit=off`, `full_page_writes=off`),
  data on `tmpfs` only where the engine supports it. Never SQLite, never a
  mocked database.

### Auth

- Never disable guards or strategies in service tests, and never add a
  test-only bypass.
- Sign test tokens with the same configuration the real strategy verifies
  (key, algorithm, issuer, audience), read from the test configuration.
- For each protected endpoint, cover the rejections (no token, invalid token,
  missing permission) besides the happy path.

### External services

- Intercept outgoing HTTP at the network level with `nock`; never mock the
  client or its wrapper.
- Deny the network by default: `nock.disableNetConnect()` plus
  `nock.enableNetConnect(/localhost|127\.0\.0\.1/)` in the e2e setup file. It
  is a guard, not a mock.
- Define the default interceptors in `beforeEach` and call `nock.cleanAll()` in
  `afterEach`.
- Override an edge case inside its own test with a unique id or path, so it
  never collides with the defaults.
- Simulate failures: timeouts (`.delay()`), 5xx, and 429 with `Retry-After`.
- Assert the outgoing payload: capture the request body in the interceptor and
  match it.

### Outcomes

Verify every exit the feature touches:

- **Response**: status and body.
- **New state**: read back through the API. Only when the service exposes no
  read for it, use the module's own repository, never raw SQL.
- **External calls**: the interceptors were hit with the expected payload
  (`scope.isDone()`).
- **Published messages**: consume them from the topic or queue in the test.
- **Observability**: on failures, the expected error log or metric is emitted.

### Data

- Service tests run in parallel across Jest workers: isolation comes from each
  test owning its data and its unique suffixes, not from execution order.
  `--runInBand` does not fix a flaky test; find the shared data instead.
- Each test creates the records it needs, with a unique suffix in unique fields
  (`` `buyer-${randomUUID()}@test.local` ``).
- Pre-load only reference data (catalogs, enum tables, configuration) in
  `globalSetup`.
- Clean up the test's records in `afterAll`.
- Assert there are no side effects on records the test did not target.

### Queues

- Each test file uses topics, queues, and consumer groups with a unique per-run
  suffix, set through the app configuration, so two files never consume each
  other's messages.
- Wait for processing with a promise resolved by the consumer's completion (a
  BullMQ `completed` or `failed` event, a test consumer on the output topic);
  never poll or sleep.
- Cover idempotency (the same message twice produces one effect), invalid
  messages (rejected, and the consumer keeps processing the next one), retries,
  and ack/nack or dead-letter behavior.

### Time

- Fake timers control only timers inside the test process: in-memory delays,
  HTTP client timeouts, local backoff. Enable them inside the test that needs
  them (`jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })`) and
  restore real timers in `afterEach`.
- They do not move BullMQ delayed jobs: those wait in Redis on a real
  timestamp. Promote the job with `job.promote()` and await its processing with
  a promise, as in Queues.

  Avoid:

  ```ts
  jest.useFakeTimers();
  await request(app.getHttpServer()).post('/payouts').send(payout).expect(202);
  jest.advanceTimersByTime(60_000);
  ```

  Keep:

  ```ts
  await request(app.getHttpServer()).post('/payouts').send(payout).expect(202);

  const [job] = await payoutsQueue.getDelayed();
  const completed = new Promise((resolve) => payoutsWorker.once('completed', resolve));
  await job.promote();
  await completed;
  ```

## Test anatomy

- Arrange, Act, Assert as three visible blocks, with one interaction per test.
- Name tests `when <condition>, then <expected outcome>`.
- Keep tests short: move repeated data setup to builders named after their
  intent (`buildOrder`).
- Assert on the whole object with a partial match (`toMatchObject`,
  `expect.objectContaining`) and type matchers for generated values
  (`expect.any(String)`). No snapshots.

  Avoid:

  ```ts
  it('creates order', async () => {
    const response = await request(app.getHttpServer()).post('/orders').send(order);
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending');
    expect(response.body).toMatchSnapshot();
  });
  ```

  Keep:

  ```ts
  it('when the order is valid, then it is created as pending', async () => {
    const order = buildOrder({ customerEmail: `buyer-${randomUUID()}@test.local` });

    const response = await request(app.getHttpServer()).post('/orders').send(order);

    expect(response).toMatchObject({
      status: 201,
      body: {
        id: expect.any(String),
        status: 'pending',
        customerEmail: order.customerEmail,
      },
    });
  });
  ```

## Mocks

- Declare mocks in the test or its `beforeEach`, where the reader sees them;
  never hide them in global or shared setup files.
- Restore mocks before each test (`restoreMocks: true` in the Jest config, or
  `jest.restoreAllMocks()` in `beforeEach`).
- No implementation mocks on the service's own code (`jest.spyOn` on an
  internal service, `overrideProvider` of an internal provider): mock only at
  the boundaries, injected dependencies in implementation detail tests and the
  network in service tests.

## Ephemeral tests

- Agents may create temporary test files to validate a hypothesis.
- Ephemeral test files must be removed when the plan of work is complete.
- Do not leave temporary or debugging tests in the repository unless they are
  intentionally part of the final suite.
