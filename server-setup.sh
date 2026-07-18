#!/bin/bash
# Server setup script for game.zanona.com.br
# Run once on a fresh Ubuntu 24.04 OCI instance (1GB RAM, no Docker)
# Usage: ssh ubuntu@game.zanona.com.br 'bash -s' < server-setup.sh

set -euo pipefail

echo "=== Installing Node.js 22 (NodeSource) ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== Installing pnpm ==="
corepack enable
corepack prepare pnpm@latest --activate

echo "=== Installing Caddy ==="
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy

echo "=== Creating app directory ==="
sudo mkdir -p /opt/capygame
sudo chown ubuntu:ubuntu /opt/capygame

echo "=== Installing systemd service ==="
sudo cp /opt/capygame/capygame.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable capygame caddy

echo "=== Configuring Caddy ==="
sudo cp /opt/capygame/Caddyfile /etc/caddy/Caddyfile

echo "=== Setup complete! ==="
echo "Run: sudo systemctl start capygame caddy"
echo "Or use: ./deploy.sh to build and deploy"
