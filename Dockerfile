# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Hardcoded public Supabase configuration (these are publishable/public keys, safe to include)
ENV VITE_SUPABASE_URL="https://nyxnvsaivmvllqevgmeh.supabase.co"
ENV VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eG52c2Fpdm12bGxxZXZnbWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzUyMDgsImV4cCI6MjA4NTExMTIwOH0.lPXNy0Jx8jBOKYNhfWymmnv0Iavcng0d_9CFjZmTkn4"
ENV VITE_SUPABASE_PROJECT_ID="nyxnvsaivmvllqevgmeh"

# Install dependencies
COPY package.json package-lock.json* bun.lockb* ./
RUN npm install

# Copy source files
COPY . .

# Make build script executable and run it
RUN chmod +x scripts/build.sh && sh scripts/build.sh

# Verify build output exists
RUN ls -la /app/dist/

# Stage 2: Production
FROM nginx:alpine AS production

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Expose port 3000
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
