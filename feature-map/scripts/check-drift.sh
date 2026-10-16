#!/usr/bin/env bash
# Feature-map drift check. Run from anywhere: check-drift.sh [repo_dir]
# 1. Every repo path cited in FEATURE_MAP.md must still exist.
# 2. (Next.js) every page.tsx / route.ts under app/ must appear in the map
#    (api/ and .well-known/ handlers skipped unless INCLUDE_API=1).
# Exit 0 = in sync, 1 = drift (details printed).
set -u
repo="${1:-.}"
cd "$repo" || exit 2
map=FEATURE_MAP.md
[ -f "$map" ] || { echo "no $map in $(pwd)"; exit 2; }

drift=0

# 1. cited paths that no longer exist (anything that looks like src/… client/… server/… app/…)
missing=$(grep -oE '(src|client|server|app|lib|components|scripts|prisma)/[A-Za-z0-9_./()\[\]@+-]+\.(tsx|ts|jsx|js|mts|mjs|prisma|html|css)' "$map" \
  | sort -u | while read -r p; do [ -e "$p" ] || echo "$p"; done)
if [ -n "$missing" ]; then
  drift=1; echo "== Cited in map but missing on disk:"; echo "$missing"
fi

# 2. Next.js App Router files not mentioned anywhere in the map
for root in src/app app; do
  [ -d "$root" ] || continue
  unindexed=$(find "$root" \( -name page.tsx -o -name page.ts -o -name page.jsx -o -name route.ts -o -name route.js \) \
    -not -path '*/node_modules/*' | { [ "${INCLUDE_API:-0}" = 1 ] && cat || grep -vE '/api/|/\.well-known/'; } \
    | sort | while read -r f; do grep -qF "$f" "$map" || echo "$f"; done)
  if [ -n "$unindexed" ]; then
    drift=1; echo "== In $root but not in the map:"; echo "$unindexed"
  fi
done

[ $drift -eq 0 ] && echo "feature map in sync"
exit $drift
