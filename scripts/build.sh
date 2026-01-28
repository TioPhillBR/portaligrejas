#!/bin/sh
# Build script that injects environment variables into .env before building
# With enhanced debugging and validation

set -e

BUILD_TIMESTAMP=$(date +%s)
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    PORTAL IGREJAS BUILD                       ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Timestamp: $BUILD_TIMESTAMP"
echo "║ Date: $BUILD_DATE"
echo "╚══════════════════════════════════════════════════════════════╝"

echo ""
echo "🔧 Step 1: Generating .env file from environment variables..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create .env file from environment variables
cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
VITE_BUILD_TIMESTAMP=${BUILD_TIMESTAMP}
EOF

echo ""
echo "📄 Generated .env file contents:"
echo "─────────────────────────────────"
cat .env
echo "─────────────────────────────────"

# Validate that required variables are set
echo ""
echo "🔍 Step 2: Validating environment variables..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

VALIDATION_FAILED=0

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ ERROR: VITE_SUPABASE_URL is empty or not set!"
    VALIDATION_FAILED=1
else
    echo "✅ VITE_SUPABASE_URL is set (${#VITE_SUPABASE_URL} chars)"
fi

if [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
    echo "❌ ERROR: VITE_SUPABASE_PUBLISHABLE_KEY is empty or not set!"
    VALIDATION_FAILED=1
else
    echo "✅ VITE_SUPABASE_PUBLISHABLE_KEY is set (${#VITE_SUPABASE_PUBLISHABLE_KEY} chars)"
fi

if [ -z "$VITE_SUPABASE_PROJECT_ID" ]; then
    echo "⚠️  WARNING: VITE_SUPABASE_PROJECT_ID is empty (optional)"
else
    echo "✅ VITE_SUPABASE_PROJECT_ID is set (${#VITE_SUPABASE_PROJECT_ID} chars)"
fi

if [ $VALIDATION_FAILED -eq 1 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  ⛔ BUILD ABORTED: Missing required environment variables!   ║"
    echo "║                                                              ║"
    echo "║  Please ensure these variables are set in Easy Panel:       ║"
    echo "║  - VITE_SUPABASE_URL                                        ║"
    echo "║  - VITE_SUPABASE_PUBLISHABLE_KEY                            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    exit 1
fi

echo ""
echo "🏗️  Step 3: Running Vite build..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build

echo ""
echo "📊 Step 4: Build output analysis..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# List JS files with their hashes
echo ""
echo "📦 Generated JS bundles:"
ls -la dist/assets/*.js 2>/dev/null | head -10 || echo "No JS files found"

echo ""
echo "🎨 Generated CSS files:"
ls -la dist/assets/*.css 2>/dev/null | head -5 || echo "No CSS files found"

# Calculate MD5 of main bundle (for cache validation)
echo ""
echo "🔐 File checksums (for cache validation):"
if command -v md5sum > /dev/null; then
    find dist/assets -name "*.js" -exec md5sum {} \; 2>/dev/null | head -5
elif command -v md5 > /dev/null; then
    find dist/assets -name "*.js" -exec md5 {} \; 2>/dev/null | head -5
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ BUILD COMPLETE!                         ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Build Timestamp: $BUILD_TIMESTAMP"
echo "║ Build Date: $BUILD_DATE"
echo "║                                                              ║"
echo "║ Environment variables were successfully injected.            ║"
echo "║ New chunk hashes generated - browser cache will refresh.     ║"
echo "╚══════════════════════════════════════════════════════════════╝"