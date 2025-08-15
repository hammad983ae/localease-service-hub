#!/bin/bash

echo "🔧 Setting up environment variables for Localease Service Hub Backend..."
echo ""

# Check if .env file already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup..."
    cp .env .env.backup
fi

# Create .env file with the new MongoDB connection string
cat > .env << EOF
# MongoDB Connection
MONGODB_URI=mongodb://mongo:bomgIVKQxBvDazjNOecSPsxTywtBAOdO@shinkansen.proxy.rlwy.net:21344

# Server Configuration
NODE_ENV=development
PORT=5002

# JWT Configuration
JWT_SECRET=your_jwt_secret_change_in_production

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://clear.high-score.dev,https://localease-service-hub-production.up.railway.app
EOF

echo "✅ .env file created successfully!"
echo "📝 Please review and modify the .env file as needed for your environment."
echo "🔒 Remember to change the JWT_SECRET in production!"
echo ""
echo "🚀 You can now start the server with: npm run start"
