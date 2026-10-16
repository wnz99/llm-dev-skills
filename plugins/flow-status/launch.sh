#!/bin/sh
set -eu
if [ "${HERDR_FLOW_STATUS_OFFLINE:-}" = "1" ]; then
  exec bun "$HERDR_PLUGIN_ROOT/src/main.ts" --cwd "$PWD" --offline
fi
exec bun "$HERDR_PLUGIN_ROOT/src/main.ts" --cwd "$PWD"
