---
name: testing-standards
version: 0.5.15
description: Testing conventions - Jest framework, unit specs colocated in src/ or under test/ depending on the project, integration tests in a separate test/ directory, and ephemeral agent tests removed when the work is done. Load when writing or modifying tests.
---

# Testing Standards

## Framework

- The testing framework is **Jest**.
- Do not assume the testing configuration; check `package.json` and the project
  README before introducing or modifying tests.

## Unit tests

- Spec files are named after the file they cover: `<name>.spec.ts`.
- Each project picks one of two layouts:
  - **Colocated**: the spec sits next to the file in `src/`
    (`src/users/user.service.ts` + `src/users/user.service.spec.ts`).
  - **Separate**: specs live in their own `test/` folder, outside `src/`.
- Follow the layout the project already uses: check the Jest config (`roots`,
  `rootDir`, `testRegex`) and the existing specs, and the project's
  `AGENTS.md` when it states one. Never mix both layouts in one project.

## Integration tests

- Integration tests live in a separate `test/` directory.

## Ephemeral tests

- Agents may create temporary test files to validate a hypothesis.
- Ephemeral test files must be removed when the plan of work is complete.
- Do not leave temporary or debugging tests in the repository unless they are
  intentionally part of the final suite.
