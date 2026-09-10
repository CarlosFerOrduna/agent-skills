---
name: commit
version: 0.5.7
description: Prepare, present, and approve Conventional Commit and push operations. Use when the user runs /commit or /push, says 'commit' or 'push', or when a checkpoint or the requirement ends and a commit message must be approved first.
---

# Commit workflow

Owns the commit and push handshake: every message is proposed and approved by
the user before anything is staged or committed.

## Gather state

- `git status --short` and the current branch.
- Unstaged diff (`git diff`) and staged diff (`git diff --cached`).
- Before a push: `git log origin/<branch>..HEAD --oneline`.

## Propose

- Build the message with `commit-conventions`: one gitmoji, a conventional type
  and scope derived from the changed paths, a header of at most 72 characters
  excluding the emoji, and an imperative lowercase subject.
- Split unrelated changes into separate commits and propose them in order.
- Present the proposed message in your reply with a one-line summary of the
  files it touches.

## Wait for approval

Stop after presenting. Do not stage, commit, amend, or rewrite history until
the user approves the message. If the user edits the wording, use exactly
their version.

## Commit

After approval, stage only the files the approved message covers and commit
with the approved message. Report the resulting short hash. Never use
`git add -A` unless the approved scope is the whole tree.

## Push

Stop again and propose the push: show the commits ahead and the target branch,
then wait for explicit approval before `git push`. Never force-push without
being asked.
