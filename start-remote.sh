#!/bin/bash
# SchoolOS — Remote Access Helper
# Start both dev servers + a Cloudflare tunnel so you can access
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

# Find local IP for convenience
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "unknown")
echo "📍 Local IP: $LOCAL_IP"
echo "📱 LAN URL:  http://$LOCAL_IP:5173"
echo ""

# Start the tunnel
echo "🌐 Starting Cloudflare tunnel → localhost:5173..."
echo "   Once the URL appears below, open it on your iPhone."
echo "   Tap Share → 'Add to Home Screen' for the best experience."
echo ""
echo "   Press Ctrl+C to stop."
echo ""

cloudflared tunnel --url http://localhost:5173
