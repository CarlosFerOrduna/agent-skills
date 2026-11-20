# agent-skills — project layer

Project rules on top of `working-agreements`.

## Pull requests

- PRs are squash-merged: the PR title becomes the commit header on `main`, and
  branch commits are working history.
- The PR title follows `commit-conventions`, at most **65 characters excluding
  the emoji**, leaving room for the ` (#n)` suffix GitHub appends. That suffix
  is GitHub's, not ours: never write it by hand.
- When the work is ready, propose the PR title and wait for approval; the user
  opens and merges the PR.

## Releases

- A change to the contract (any `skills/` rule) bumps the version in the same
  PR: `package.json`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, every `SKILL.md` frontmatter, and the
  "Contract version" section of `working-agreements`. The PR title ends with
  the version: `(v0.5.14)`.
- Docs, formatting, and tooling changes do not bump the version.
- Run `npm run check` before proposing the PR title.
