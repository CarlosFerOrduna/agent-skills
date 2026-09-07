# Enforcement base — commit-time guards for the working-agreements standards

Prompt-based standards decay; a lint error corrects faster and cheaper than a
13 KB prompt. These templates turn the conventions into machine-checked gates
for the consuming project repo (not for the skills repo itself).

| Tool       | Enforces                        | File                      |
| ---------- | ------------------------------- | ------------------------- |
| commitlint | gitmoji + 11 types + header ≤72 | `commitlint.config.cjs`   |
| ESLint     | `unicorn/filename-case` (kebab) | `eslint.config.mjs`       |
| gitleaks   | no secrets in commits           | `.gitleaks.toml`          |
| pre-commit | gitleaks + hygiene hooks        | `.pre-commit-config.yaml` |

What stays in the skills (not lintable):

- Repository methods express business intent (`findResumable`).
- Enums synchronized across TS / DB / seeds / contracts.
- Joi as the source of truth for env config.

## Setup (commitlint + gitmoji header)

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
cp enforcement/commitlint.config.cjs <project>/commitlint.config.cjs
```

Wire the commit-msg hook (husky) so the header is validated before the commit
is created:

```bash
# .husky/commit-msg
npx --no-install commitlint --edit "$1"
```

- `header-leading-gitmoji` — the header must start with a gitmoji.
- `type-enum` — only the 11 valid Conventional Commits types.
- `header-max-length-no-emoji` — ≤72 characters excluding the emoji (handles
  U+FE0F variation selectors).

## Setup (ESLint filename-case)

```bash
pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-unicorn
# copy the relevant fragment from enforcement/eslint.config.mjs into the
# project's eslint.config.mjs
```

`unicorn/filename-case` enforces lowercase `kebab-case`, the highest-value,
lowest-cost rule (barrel `index.ts` and `*.config.*` are exempt). The
`no-restricted-imports` block for deep relative chains is optional and commented
out: the import convention (relative within a module, `@/` alias across
boundaries) is enforced only if the team opts in.

## Setup (gitleaks on commit)

Scan secrets with the pre-commit hook; it downloads the gitleaks binary
itself, so no manual install is needed:

```bash
cp enforcement/.pre-commit-config.yaml <project>/.pre-commit-config.yaml
pre-commit install        # wires the gitleaks + hygiene hooks
# refresh pinned revisions periodically:
pre-commit autoupdate
```

> Do not install gitleaks from npm (`pipx install gitleaks`, `pnpm add -D
gitleaks`, `scoop/bower per platform`): the npm `gitleaks` package is an
> unrelated third-party mirror. The official distribution channels are the
> GitHub release binaries, `brew`, `choco`, and the pre-commit hook above.

Copy the baseline too:

```bash
cp enforcement/.gitleaks.toml <project>/.gitleaks.toml
```

Allowlist entries only for fixture/test values, never real credentials. Both
the pre-commit hook and a CI gate run gitleaks against staged/committed files.

## Enforcement priority

1. commitlint — stops non-conventional headers at the source.
2. gitleaks — non-negotiable secret gate.
3. `unicorn/filename-case` — cheap, catches the most common review comment.

Tip: verify the pipeline with a deliberate bad commit before adopting.
If a rule produces noise, tighten the config, not the prompt.
