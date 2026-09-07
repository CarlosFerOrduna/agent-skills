---
name: using-working-agreements
description: Use at the start of any conversation or task - establishes that the working-agreements skill must always be applied before answering, coding, or reviewing, and tells the agent how to load it.
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task and already have the working agreements loaded, ignore this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
The project follows a defined set of engineering standards. You MUST load and apply them.

IF THE WORKING AGREEMENTS APPLY TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE THEM.

This is not negotiable. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## The Rule

**Load the `working-agreements` skill BEFORE any response or action** — including asking clarifying questions, exploring the codebase, or writing code. If a rule conflicts with an explicit user instruction, the user instruction wins.

Then announce "Applying working agreements" and follow them exactly.

## What the working agreements cover

- Language: code in English, JSDoc in English, inline comments in Spanish.
- Commits: Conventional Commits with a leading gitmoji.
- Code style: ESLint + Prettier, SOLID / DRY / KISS / Clean Architecture / Clean Code.
- Naming: camelCase symbols, PascalCase types, kebab-case files.
- Security: never log or expose secrets, keys, or tokens.
- Architecture: microservices with explicit service boundaries.
- Testing: Jest, unit tests alongside code, ephemeral tests removed when done.
- Agent workflow: check package.json and lockfile, lint before committing, keep enums and values synchronized across their sources.

## How to load the skill

Use the `skill` tool to load `working-agreements`.

If the skill is not available in the current harness, follow the file directly:

- OpenAI / convention path: `SKILL.md` files under `~/.agents/skills/` or the plugin/marketplace skills directory.
- Read the instructions and apply them as if they were a direct project instruction.