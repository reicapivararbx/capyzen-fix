#!/bin/bash
# Deploy to remote server via SSH
# Usage: ./deploy-remote.sh user@server

set -e

SERVER=${1:-"ubuntu@game.zanona.com.br"}
REMOTE_DIR="/opt/capyzen"

echo "📤 Syncing files to ${SERVER}..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.omo' \
  --exclude '.manus-logs' \
  ./ ${SERVER}:${REMOTE_DIR}/

echo "🔧 Building and starting on remote..."
ssh ${SERVER} "cd ${REMOTE_DIR} && docker compose down && docker compose up --build -d"

echo "✅ Remote deploy complete!"
echo "🔗 Access: https://game.zanona.com.br"
