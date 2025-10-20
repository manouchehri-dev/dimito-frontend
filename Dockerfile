FROM node:24-alpine AS builder

WORKDIR /app

# Define build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_PROJECT_ID
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_FACTORY_ADDRESS
ARG NEXT_PUBLIC_PRESALE_ADDRESS
ARG NEXT_PUBLIC_GOFTINO_ID

# Set environment variables from build args
ENV NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_FACTORY_ADDRESS=${NEXT_PUBLIC_FACTORY_ADDRESS}
ENV NEXT_PUBLIC_PRESALE_ADDRESS=${NEXT_PUBLIC_PRESALE_ADDRESS}
ENV NEXT_PUBLIC_GOFTINO_ID=${NEXT_PUBLIC_GOFTINO_ID}

# Copy only package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies (use clean install with lockfile)
RUN npm ci

# Copy source files and config files
COPY jsconfig.json ./
COPY next.config.mjs ./
COPY public ./public
COPY src ./src
COPY messages ./messages
COPY *.config.* ./

# Build the app
RUN npm run build

# Production stage - use a smaller base image
FROM node:24-alpine AS runner

# Set working directory
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Pass environment variables from build stage
ARG NEXT_PUBLIC_PROJECT_ID
ENV NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ARG NEXT_PUBLIC_FACTORY_ADDRESS
ENV NEXT_PUBLIC_FACTORY_ADDRESS=${NEXT_PUBLIC_FACTORY_ADDRESS}
ARG NEXT_PUBLIC_PRESALE_ADDRESS
ENV NEXT_PUBLIC_PRESALE_ADDRESS=${NEXT_PUBLIC_PRESALE_ADDRESS}
ARG NEXT_PUBLIC_GOFTINO_ID
ENV NEXT_PUBLIC_GOFTINO_ID=${NEXT_PUBLIC_GOFTINO_ID}

# Copy only the necessary built files from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/messages ./messages

# Expose the port
EXPOSE 3000

# Use non-root user
USER nextjs

# Start with the more reliable direct command to Next.js binary
CMD ["node", "server.js"] 