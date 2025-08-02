#!/bin/bash

# Good Girl Points - Deployment Script
# This script helps with deploying the app to various platforms

echo "🚀 Good Girl Points Deployment Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Failed to build frontend"
    exit 1
fi

cd ..

# Test backend
echo "🧪 Testing backend..."
cd backend
node test.js

if [ $? -eq 0 ]; then
    echo "✅ Backend tests passed"
else
    echo "⚠️  Backend tests failed, but continuing..."
fi

cd ..

echo ""
echo "🎉 Setup complete! Your app is ready for deployment."
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy frontend to Vercel:"
echo "   - Go to vercel.com"
echo "   - Connect your GitHub repo"
echo "   - Set build command: cd frontend && npm install && npm run build"
echo "   - Set output directory: frontend/build"
echo ""
echo "3. Deploy backend to Render:"
echo "   - Go to render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set build command: cd backend && npm install"
echo "   - Set start command: cd backend && npm start"
echo "   - Add environment variables:"
echo "     SESSION_SECRET=your-secret-key"
echo "     FRONTEND_URL=https://your-frontend-url.vercel.app"
echo "     NODE_ENV=production"
echo ""
echo "4. Update frontend environment variables:"
echo "   REACT_APP_API_URL=https://your-backend-url.onrender.com"
echo ""
echo "💖 Good luck with your deployment!" 