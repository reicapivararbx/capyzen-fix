#!/bin/bash
# Deploy CapyZen to game.zanona.com.br (no Docker, Node.js + Caddy)
# Usage: ./deploy.sh

set -euo pipefail

SERVER="ubuntu@game.zanona.com.br"
REMOTE_DIR="/opt/capygame"

echo "🔨 Building locally..."
pnpm run build

echo "📦 Syncing to server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.omo' \
  --exclude '.manus-logs' \
  --exclude 'uploads' \
  ./ ${SERVER}:${REMOTE_DIR}/

echo "📦 Installing/updating dependencies on server..."
ssh ${SERVER} "cd ${REMOTE_DIR} && pnpm install --frozen-lockfile --prod"

echo "🔄 Restarting services..."
ssh ${SERVER} "sudo systemctl restart capygame"

echo "✅ Deploy complete!"
echo "🔗 Access: https://game.zanona.com.br"
