#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
cp "$ROOT/enforcement/commitlint.config.cjs" ./commitlint.config.cjs
git init -q
pnpm add -D @commitlint/cli @commitlint/config-conventional >/dev/null

failures=0
run_case() {
  local name="$1" want="$2" header="$3" got
  printf '%s\n' "$header" > msg.txt
  set +e
  pnpm exec commitlint --edit msg.txt >/dev/null 2>&1
  got=$?
  set -e
  if [ "$got" -eq "$want" ]; then
    echo "PASS $name (exit=$got)"
  else
    echo "FAIL $name (want exit=$want, got $got)"
    failures=$((failures + 1))
  fi
}

long="✨ feat(auth): "
for _ in $(seq 1 95); do long="${long}x"; done

run_case "valid gitmoji header"     0 "✨ feat(auth): add JWT refresh-token rotation"
run_case "missing gitmoji"          1 "feat(auth): add JWT refresh-token rotation"
run_case "invalid type"             1 "✨ banana(auth): add thing"
run_case "header over 72 (no emoji)" 1 "$long"
run_case "breaking change"          0 "✨ feat!: drop the old api"

exit "$failures"