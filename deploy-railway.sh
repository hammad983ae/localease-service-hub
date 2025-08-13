#!/bin/bash

echo "🚀 Deploying Localease Backend to Railway..."
echo "📅 $(date)"
echo "📁 Current directory: $(pwd)"

# Check if we're in the root directory
if [[ ! -f "railway.json" ]]; then
    echo "❌ Error: This script must be run from the root directory"
    echo "💡 Please run: ./deploy-railway.sh"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if we're already in a Railway project
if [[ -f ".railway" ]]; then
    echo "✅ Already linked to Railway project"
else
    echo "🔐 Logging into Railway..."
    railway login
    
    echo "🔗 Linking to Railway project..."
    echo "💡 If you don't have a project yet, create one at https://railway.app"
    railway link
fi

# Set environment variables
echo "🔧 Setting environment variables..."
echo "⚠️  Make sure to replace these with your actual values!"

# Set NODE_ENV
railway variables set NODE_ENV=production

# Set JWT_SECRET (generate a secure one if needed)
if [[ -z "$JWT_SECRET" ]]; then
    echo "🔑 Generating secure JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo "🔑 Generated JWT_SECRET: $JWT_SECRET"
fi
railway variables set JWT_SECRET="$JWT_SECRET"

# Set MONGODB_URI
if [[ -z "$MONGODB_URI" ]]; then
    echo "🗄️  Please set your MongoDB connection string:"
    echo "💡 Example: mongodb+srv://username:password@cluster.mongodb.net/localease"
    read -p "MONGODB_URI: " MONGODB_URI
fi
railway variables set MONGODB_URI="$MONGODB_URI"

# Show current variables
echo "📊 Current Railway variables:"
railway variables

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🔗 Your backend should be available at your Railway URL"
echo "🏥 Health check: your-railway-url/health"
echo "📊 View logs: railway logs"
echo "📊 View status: railway status"
