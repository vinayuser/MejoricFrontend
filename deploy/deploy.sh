#!/usr/bin/env bash
set -euo pipefail

# Build and start/restart the frontend on port 3004 (Ubuntu, no Docker).
# Run from the front/ directory:
#   chmod +x deploy/deploy.sh && ./deploy/deploy.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Error: .env not found in $ROOT_DIR"
  echo "Copy .env.example to .env and fill in your values."
  exit 1
fi

# Load PORT and VITE_BASE from .env if set
set -a
# shellcheck disable=SC1091
source .env
set +a

export PORT="${PORT:-3004}"
export NODE_ENV=production

install_deps() {
  if [[ -f package-lock.json ]]; then
    echo "==> Installing dependencies with npm ci..."
    npm ci
    return
  fi

  echo "==> Installing dependencies with npm install..."
  npm install
}

echo "==> Installing dependencies..."
install_deps

echo "==> Building production bundle (VITE_BASE=${VITE_BASE:-/})..."
npm run build

echo "==> Starting on port $PORT with PM2..."
if pm2 describe mejoric-front >/dev/null 2>&1; then
  pm2 restart ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo ""
echo "Frontend is running at http://$(hostname -I | awk '{print $1}'):$PORT"
echo "Logs: pm2 logs mejoric-front"
echo "Status: pm2 status"
