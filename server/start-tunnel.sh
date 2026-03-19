#!/bin/bash
# SchoolOS — Start tunnel for email forwarding
# This creates a public URL that Gmail can forward emails to.
#
# Usage: ./start-tunnel.sh
#
# After starting, copy the URL and set up Gmail forwarding to:
#   <tunnel-url>/api/ingest/email

set -e

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    brew install cloudflared
fi

echo "🌐 Starting tunnel to localhost:3001..."
echo ""
echo "Once the tunnel URL appears, set up Gmail forwarding:"
echo "  1. Go to Gmail → Settings → Forwarding"
echo "  2. Add forwarding address: <tunnel-url>/api/ingest/email"
echo "  3. Or use a Gmail filter to auto-forward specific senders"
echo ""
echo "Press Ctrl+C to stop the tunnel."
echo ""

cloudflared tunnel --url http://localhost:3001
