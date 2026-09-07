---
name: using-working-agreements
description: Always-on bootstrap - establishes that the agent works under an engineering contract and must load the working-agreements skill before responding, coding, or reviewing, and tells it how. Applied automatically by the harness plugin; do not ask the model to load this skill on user request.
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task and already have the working agreements loaded, ignore this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
You are working under an always-on engineering contract defined in the `working-agreements` skill. Honor the contract before any response or action.

If a rule conflicts with an explicit user instruction, the user instruction wins.
</EXTREMELY-IMPORTANT>

## What the contract covers

Load `working-agreements` (always-on), then the matching stack skill when the
task touches its area:

- `working-agreements` — language, security, architecture, package manager,
  timestamps and logging, agent workflow.
- `commit-conventions` — Conventional Commits with a leading gitmoji.
- `nestjs-code-style` — TypeScript / NestJS style, naming, types, repositories.
- `database` — versioned SQL migrations and ORM schema discipline.
- `testing-standards` — Jest, unit and integration test layout.

## How to load the skills

Use the `skill` tool to load them.

If skills are not available in the current harness, follow the files directly:

- OpenAI / convention path: `SKILL.md` files under `~/.agents/skills/` or the
  plugin/marketplace skills directory.
- Read the instructions and apply them as if they were a direct project
  instruction.