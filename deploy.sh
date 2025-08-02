#!/bin/bash

# Install all dependencies
echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Build frontend
echo "Building frontend..."
cd frontend && npm run build && cd ..

# Copy frontend build to backend
echo "Copying frontend build to backend..."
mkdir -p backend/frontend
cp -r frontend/build/* backend/frontend/

echo "Deployment setup complete!" 