#!/bin/bash

echo "🚀 Starting Localease Backend in Production Mode..."
echo "📅 $(date)"
echo "🔧 Node Version: $(node --version)"
echo "🔧 NPM Version: $(npm --version)"
echo "🔧 Current Directory: $(pwd)"
echo "🔧 Environment: $NODE_ENV"

# Set production environment
export NODE_ENV=production

# Increase memory limit and add production flags
exec node \
  --max-old-space-size=2048 \
  --optimize-for-size \
  --enable-source-maps \
  server-integrated.cjs
