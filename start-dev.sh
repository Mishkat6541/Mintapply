#!/bin/bash

# Mintapply Development Startup Script

echo "🚀 Starting Mintapply Development Environment"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Mintapply root directory"
    exit 1
fi

# Start backend in background
echo "📡 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🌐 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started successfully!"
echo "📡 Backend API: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "🔧 Available test redemption codes:"
echo "   - MINT10 (10 tokens)"
echo "   - MINT25 (25 tokens)"
echo "   - MINT100 (100 tokens)"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait