#!/usr/bin/env bash
set -euo pipefail

# One-time Ubuntu server setup for Mejoric frontend (no Docker).
# Run: chmod +x deploy/ubuntu-setup.sh && ./deploy/ubuntu-setup.sh

echo "==> Installing Node.js 20..."
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Node version: $(node -v)"
echo "==> npm version: $(npm -v)"

echo "==> Enabling pnpm..."
corepack enable
corepack prepare pnpm@latest --activate

echo "==> Installing PM2 globally..."
sudo npm install -g pm2

echo "==> Opening port 3004 in firewall (if ufw is active)..."
if command -v ufw >/dev/null 2>&1 && sudo ufw status | grep -q "Status: active"; then
  sudo ufw allow 3004/tcp
fi

echo ""
echo "Setup complete. Next steps:"
echo "  1. cd front"
echo "  2. Copy/configure .env (set PORT=3004, VITE_BASE=/, API URLs, etc.)"
echo "  3. chmod +x deploy/deploy.sh && ./deploy/deploy.sh"
echo "  4. pm2 startup   # run the command it prints, then: pm2 save"
