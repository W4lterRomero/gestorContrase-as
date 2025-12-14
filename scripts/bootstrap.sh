#!/bin/bash
set -e

# 1. Install NVM if missing
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
    echo "⬇️ Installing NVM..."
    if command -v curl >/dev/null 2>&1; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    elif command -v wget >/dev/null 2>&1; then
        wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    else
        echo "❌ neither curl nor wget found. Cannot install NVM."
        exit 1
    fi
else
    echo "✅ NVM already installed"
fi

# 2. Load NVM
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Install Node
echo "⬇️ Installing Node v20..."
if ! command -v nvm >/dev/null 2>&1; then
    echo "❌ NVM failed to load."
    exit 1
fi

nvm install 20
nvm use 20
nvm alias default 20

# 4. Install pnpm
echo "⬇️ Installing pnpm..."
npm install -g pnpm

# 5. Run Setup
echo "🚀 Running Project Setup..."
chmod +x scripts/setup.sh
./scripts/setup.sh

# 6. Start Dev
echo "🔥 Starting Dev Server..."
pnpm dev
