#!/bin/sh
# Build script that injects environment variables into .env before building

echo "🔧 Generating .env file from environment variables..."

# Create .env file from environment variables
cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}
EOF

echo "📄 Generated .env file:"
cat .env

echo ""
echo "🏗️ Starting build..."
npm run build

echo "✅ Build complete!"
