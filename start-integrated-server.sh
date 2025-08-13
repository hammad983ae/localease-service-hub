#!/bin/bash

echo "🚀 Starting Localease Service Hub Integrated Server..."
echo "📡 This server handles both REST API and WebSocket connections"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping integrated server..."
    pkill -f "server-integrated.cjs"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start the integrated server
echo "🌟 Starting integrated server on port 5002..."
cd backend
npm run start:prod

# This will only run if the server exits unexpectedly
echo "❌ Server stopped unexpectedly"
cleanup
