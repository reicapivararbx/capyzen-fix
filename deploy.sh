#!/bin/bash
# Deploy CapyZen to dev.zanona.com.br/matteo
set -e

echo "🚀 Building Docker image..."
docker compose build --no-cache

echo "📦 Starting container..."
docker compose up -d

echo "✅ Deploy complete!"
echo "🌐 Access: http://localhost:3000"
echo "🔗 Public: https://dev.zanona.com.br/matteo"
