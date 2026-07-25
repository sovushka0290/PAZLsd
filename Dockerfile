# Production image for Nuxt 4 (Nitro).
# Pre-built .output is copied from the host (npm run build runs BEFORE docker build).
FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY .output/server/package.json ./package.json
RUN npm install --omit=dev

COPY .output ./.output
# Снимок API (npm run api-snapshot): нужен при NUXT_API_SNAPSHOT=1, иначе Nitro отдаст 404 по /api/v2/…
COPY data/api-snapshot ./data/api-snapshot

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
