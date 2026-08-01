#!/usr/bin/env bash
# Pull, build and restart. Run from the project root on the VPS:
#   ./deploy/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Backing up the database"
./deploy/backup.sh

echo "→ Pulling latest code"
git pull --ff-only

echo "→ Installing dependencies"
npm ci --omit=dev --include=dev

echo "→ Applying schema changes"
npm run db:push -- --force

echo "→ Building"
npm run build

echo "→ Restarting"
pm2 reload ecosystem.config.cjs --update-env

echo "✓ Deployed"
