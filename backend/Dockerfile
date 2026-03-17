# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching — only re-runs npm install when deps change)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy rest of the source
COPY . .

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:18-alpine

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=appuser:appgroup /app ./

USER appuser

EXPOSE 5000

# Health check — ECS will mark the task healthy once this passes
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
