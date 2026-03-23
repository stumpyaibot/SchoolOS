#!/bin/bash
# SchoolOS — Remote Access Helper
# Starts backend, frontend, and Cloudflare tunnel so you can access
# SchoolOS from your iPhone on any network.
#
# Usage: ./start-remote.sh
#
# Prerequisites:
#   brew install cloudflared
#
# On your iPhone:
#   1. Open the tunnel URL in Safari
#   2. Tap Share → "Add to Home Screen"
#   3. SchoolOS will run like a native app

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    brew install cloudflared
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  🏫 SchoolOS — Remote Access"
echo "═══════════════════════════════════════════════════"
echo ""

# Kill all child processes on Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Stopping all servers..."
    kill 0
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting backend (port 3001)..."
cd "$SCRIPT_DIR/server" && npm run dev &> /tmp/schoolos-server.log &

# Wait for backend to be ready
echo "   Waiting for backend..."
for i in {1..20}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "   ✅ Backend ready"
        break
    fi
    sleep 1
done

# Start frontend
echo "🎨 Starting frontend (port 5173)..."
cd "$SCRIPT_DIR/app" && npm run dev &> /tmp/schoolos-app.log &
sleep 2

# Find local IP for convenience
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "unknown")
echo ""
echo "📍 Local IP: $LOCAL_IP"
echo "📱 LAN URL:  http://$LOCAL_IP:5173"
echo ""

# Start the tunnel
echo "🌐 Starting Cloudflare tunnel → localhost:5173..."
echo "   Once the URL appears below, open it on your iPhone."
echo "   Tap Share → 'Add to Home Screen' for the best experience."
echo ""
echo "   Press Ctrl+C to stop everything."
echo ""

cloudflared tunnel --url http://localhost:5173
