#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Installing Node 18..."
nvm install 18
nvm use 18
nvm alias default 18

echo "Node Version:"
node -v
echo "NPM Version:"
npm -v

echo "Installing pnpm..."
npm install -g pnpm

echo "PNPM Version:"
pnpm -v
