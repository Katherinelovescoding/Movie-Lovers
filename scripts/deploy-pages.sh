#!/bin/sh
set -e
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT"

npm run build:pages

git fetch origin gh-pages:gh-pages
work=$(mktemp -d)
git worktree add "$work" gh-pages

find "$work" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -a client/dist/. "$work/"

cd "$work"
git add -A
if git diff --cached --quiet; then
  echo "GitHub Pages is already up to date."
else
  git commit -m "Update the GitHub Pages site."
  git push origin gh-pages
fi

cd "$ROOT"
git worktree remove "$work"
