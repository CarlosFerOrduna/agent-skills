---
name: code-intelligence
version: 0.5.11
description: Codebase search and graph navigation - ripgrep (fast text search), ast-grep (structural patterns), and graphify (architecture graphs when graphify-out exists). Load when searching code, tracing references, understanding file relationships, or answering architecture questions; detects which tools exist and falls back to built-in search.
---

# Code Intelligence

Search and navigation are progressive enhancement: nothing here is assumed to be
installed. Detect what exists, use the best tool for the question, and fall
back to the harness's built-in search when nothing is available.

## Capability detection

Run these checks to know what is available before choosing an approach:

```bash
command -v rg                        # ripgrep: fast plain-text search
command -v ast-grep || command -v sg # ast-grep: structural pattern search
test -d graphify-out                 # knowledge graph for architecture questions
```

## Choosing the right tool

- **rg (ripgrep)** — first choice for plain-text and symbol lookup: definitions,
  usages, literals, config keys, filenames. Fast across large trees, no
  language knowledge needed. Honor `.gitignore` by default; add `-g` filters
  for focused scans.
- **ast-grep (sg)** — structural searches that text search cannot express:
  multi-line shapes, declarations, statements to refactor, patterns with
  metavariables (for example `await $CALL() ?? $DEFAULT`). Language-aware via
  its built-in parsers; run with the project language and pattern syntax before
  settling for a regex approximation.
- **graphify** — architecture and semantic questions, but only when
  `graphify-out/` exists: where a file sits in the codebase, what depends on
  it, layered summaries and community structure. Run `graphify query` / the
  graphify skill workflow; do not rebuild the graph ad hoc.
- **built-in search (fallback)** — when none of the above is installed, use the
  harness's global search (grep/glob equivalent). Also fine for quick
  single-pattern searches where spinning up a dedicated tool is overkill.

Prefer the fastest tool that answers the question. Do not contort a text search
into a structural query, and do not launch a graph rebuild to answer a question
the existing graph already covers.

## Windows specifics

These tools run from **bash** (git-bash or msys2), not PowerShell:

- `ast-grep`/`sg` installed via pnpm ship POSIX shims under the pnpm bin
  directory that run under bash; the `.ps1` variants are blocked by the
  PowerShell execution policy, so do not rely on them.
- `rg` is installed via winget as `rg.exe` on the Windows PATH and works from
  any shell.

## Graph maintenance

Local to each developer's machine (never shared through `core.hooksPath`):

- Keep `graphify-out/` fresh after code changes so answers stay accurate.
- Install the graphify hooks so the graph rebuilds after a **commit** and after
  a **merge/pull**, since the team exchanges code through both paths.
- The hooks re-extract only changed code files and skip doc/image-only changes.
- At session start run `graphify reflect --if-stale` to refresh the lessons
  cheaply. If the hooks are already installed this is a near no-op.

## Merging graphs across a system

Single repos get one `graphify-out/`; a system of repos (monorepo, multiple
microservices) composes them bottom-up with `graphify merge-graphs`. The
topology is a convention, not a manifest: merge every directory that contains
under it another `graphify-out/graph.json`, one level at a time.

- **Leaf**: a repo with its own `graphify-out/graph.json`. Hooks refresh these
  after commit and merge/pull.
- **Container**: any directory whose immediate children each expose a
  `graphify-out/graph.json`. Merge them into the container's own graph:

```bash
# Merge leaf repos that live under a shared container directory
graphify merge-graphs \
  ./<container>/<repo-a>/graphify-out/graph.json \
  ./<container>/<repo-b>/graphify-out/graph.json \
  --out ./<container>/graphify-out/graph.json
```

- **Root**: repeat the same rule at the top level, mixing container graphs and
  standing-alone leaf graphs. Any level feeds the next one:

```bash
graphify merge-graphs \
  ./<container>/graphify-out/graph.json \
  ./<standalone-leaf>/graphify-out/graph.json \
  --out ./graphify-out/graph.json
```

Merged graphs are themselves `graph.json`, so they chain: a container merge can
feed a higher merge with no extra step. This convention is architecture-blind it does not care about the tree shape, the name of a level, or whether the
inputs are services, libraries, or monorepo workspaces. You chose the levels;
the rule is the same at each one.

Provenance: `merge-graphs` stamps each node with `repo` built from the input
directories of the immediate merge, and prefixes node ids with those directory
names (`<container>::<repo-a>::SomeModule`). Deeper provenance survives in
the id prefix, not in the `repo` field: when a merged asset enters a second
merge, its `repo` becomes the container name while the id keeps the full
path back to the source repo. Filter by the id prefix to attribute a node to
its originating service.

Containers and roots are not git repos, so the merge is on demand rather than
hooked: when a question spans levels, or after a pull changed leaf graphs,
re-run the chain from the leaf up. A failing or missing leaf graph should be
rebuilt (or excluded) before merging, so the container graph never silently
drops a service.

## AGENTS.md integration

Where the tools exist, the project's `AGENTS.md` gets a short search section so
every agent knows what to prefer. The section should stay minimal:

```markdown
## Codebase search
- `rg <pattern>` for fast text search (ripgrep installed)
- `sg -p '<pattern>'` (ast-grep) for structural searches
- `graphify-out/` present: use the graph for architecture questions (see `/graphify`)
- multi-repo system: merged graph at the root, filter by the id prefix (`<container>::<repo>::...`)
```

When a project has none of these tools, do not add the section; rely on the
capability detection above and the harness fallback.
