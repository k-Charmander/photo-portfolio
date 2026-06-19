#!/bin/bash
set -euo pipefail

# SessionStart hook for photo-portfolio.
# Installs the dev toolchain (Prettier / ESLint / Stylelint / html-validate)
# and starts a static live-preview server so the page can be checked in a browser.
# Synchronous, idempotent, non-interactive.

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

PORT=8000
PREVIEW_LOG="/tmp/preview-server.log"

echo "[session-start] Installing dependencies (npm install)..."
npm install

# Start (or restart) the static preview server, detached, in the background.
echo "[session-start] Starting preview server on port ${PORT}..."

# Kill any existing listener on the port so the hook stays idempotent.
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
fi

# Detach fully so the long-running server does not block the hook.
setsid bash -c "exec npx serve -l ${PORT} . > '${PREVIEW_LOG}' 2>&1" < /dev/null &
disown || true

echo "[session-start] Preview server starting at http://localhost:${PORT} (logs: ${PREVIEW_LOG})"
echo "[session-start] Done."
