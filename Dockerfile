# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for environment variables - MUST be declared before use
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

# Set environment variables for build - Vite reads these during compilation
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
ENV VITE_SUPABASE_PROJECT_ID=${VITE_SUPABASE_PROJECT_ID}

# Debug: Print env vars to verify they are set (remove in production)
RUN echo "Building with SUPABASE_URL: ${VITE_SUPABASE_URL:-NOT_SET}"

# Install dependencies
COPY package.json package-lock.json* bun.lockb* ./
RUN npm install

# Copy source files
COPY . .

# Build the application - Vite will inline the env vars
RUN npm run build

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
