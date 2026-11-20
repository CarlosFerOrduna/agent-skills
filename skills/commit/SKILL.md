---
name: commit
version: 0.5.14
description: Prepare, present, and approve Conventional Commit and push operations. Use when the user runs /commit or /push, says 'commit' or 'push', or when a checkpoint or the requirement ends and a commit message must be approved first.
---

# Commit workflow

Owns the commit handshake: every message is proposed and approved by the user
before anything is staged or committed.

## Gather state

Run it in every repo the change touches:

- `git status --short` and the current branch.
- Unstaged diff (`git diff`) and staged diff (`git diff --cached`).

## Check the branch

- Never commit on the shared integration branch (`development`, or the one the
  project's `AGENTS.md` names); commit on the working branch. If the work sits
  on the integration branch, stop and say so.
- Never use `git stash`. To move work between branches, fast-forward without
  checking out: `git fetch . <source>:<target>`. It only works when `<target>`
  is not checked out and the move is a fast-forward; otherwise stop and ask.

## Propose

- Build the message with `commit-conventions`: one gitmoji, a conventional type
  and scope derived from the changed paths, a header of at most 72 characters
  excluding the emoji, and an imperative lowercase subject.
- Split unrelated changes into separate commits and propose them in order.
- Show each repo's diff first (for a long diff, `git diff --stat` plus the
  relevant hunks), then the proposed message with a one-line summary of the
  files it touches.

## Wait for approval

Stop after presenting. Do not stage or commit until the user approves the
message. If the user edits the wording, use exactly their version.

A question is not approval: "are we ready to commit?" gets an answer, not a
commit. Only an explicit order counts.

## Commit

After approval, stage only the files the approved message covers and commit
with the approved message. Report the resulting short hash. Never use
`git add -A` unless the approved scope is the whole tree.

A commit already made is final: never amend, rebase, or reset to fix its
message (header length, a ticket reference). Apply the rule from the next
commit on.

## Push

Never propose a push after committing: the user pushes when the whole work is
done. Push only when the user runs `/push` or asks explicitly; then show
`git log origin/<branch>..HEAD --oneline` and the target branch, and wait for
approval. Never force-push.
