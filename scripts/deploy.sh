#!/usr/bin/env bash
# Deploys this folder to devtga.com: ships the source (without node_modules,
# build output, local data or env files), then builds and restarts the
# container on the server. Content edited in /admin lives in a Docker volume
# and is not touched by a deploy.
set -euo pipefail

HOST="${PORTFOLIO_HOST:-YZ@178.105.242.183}"
DIR=/opt/portfolio
cd "$(dirname "$0")/.."

echo "Shipping to $HOST:$DIR/app"
tar --exclude=./node_modules --exclude=./.next --exclude=./.data --exclude='./.env*' \
    --exclude=./.git --exclude='*.tsbuildinfo' -czf - . | ssh "$HOST" "
  set -e
  rm -rf $DIR/app.new && mkdir -p $DIR/app.new
  tar -xz -C $DIR/app.new
  date -u +%Y-%m-%dT%H:%M:%SZ > $DIR/app.new/DEPLOYED_AT
  rm -rf $DIR/app && mv $DIR/app.new $DIR/app
"

echo "Building and restarting"
ssh "$HOST" "
  set -e
  cd $DIR
  docker compose -p portfolio -f app/deploy/docker-compose.yml --env-file .env up -d --build
  docker image prune -f >/dev/null
  docker compose -p portfolio -f app/deploy/docker-compose.yml --env-file .env ps
"

echo "Deployed: https://devtga.com"
