# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY src/ ./src/

# Stage 2: Production (Hardened)
FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=builder /app/src ./src

# Read-only dosya sistemi uyumluluğu ve yetki düşürme
RUN chown -R node:node /usr/src/app
USER node

ENV NODE_ENV=production

ENTRYPOINT ["node", "src/extractor.js"]
CMD ["--help"]
