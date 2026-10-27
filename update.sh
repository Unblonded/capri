#!/usr/bin/env sh
# Update Capri on the server: pull the latest code and install any new packages.
# If Capri is running with "npm run serve" it restarts itself; the website updates on the next page refresh.
set -e
cd "$(dirname "$0")"
node scripts/update.mjs "$@"
