---
name: testing-standards
version: 0.5.0
description: Testing conventions - Jest framework, unit tests alongside the code they cover, integration tests in a separate test/ directory, and ephemeral agent tests removed when the work is done. Load when writing or modifying tests.
---

# Testing Standards

## Framework

- The testing framework is **Jest**.
- Do not assume the testing configuration; check `package.json` and the project
  README before introducing or modifying tests.

## Unit tests

- Unit tests live alongside the code they test:

```text
user.service.ts
user.service.spec.ts
```

## Integration tests

- Integration tests live in a separate `test/` directory.

## Ephemeral tests

- Agents may create temporary test files to validate a hypothesis.
- Ephemeral test files must be removed when the plan of work is complete.
- Do not leave temporary or debugging tests in the repository unless they are
  intentionally part of the final suite.
