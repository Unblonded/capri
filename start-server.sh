#!/usr/bin/env sh
# Run Capri with auto-update: checks GitHub every minute, pulls new commits and restarts itself.
cd "$(dirname "$0")"
while :; do
  node scripts/autoserve.mjs
  [ $? -eq 75 ] || break
done
