#!/bin/sh
# macOS / Linux: set up and start the backend + frontend. Ctrl+C stops both. Options: --reset, --open, --help
# The real script is scripts/start.mjs (Node.js), so it behaves the same on every OS.
command -v node >/dev/null 2>&1 || { echo "Node.js 20+ is required: https://nodejs.org"; exit 1; }
exec node "$(dirname "$0")/scripts/start.mjs" "$@"
