# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app/apps/public-cms
COPY apps/public-cms/package.json apps/public-cms/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app/apps/public-cms
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=https://elitsanatvesporkulubu.com
ARG NEXT_PUBLIC_CMS_ASSET_PREFIX=/cms-assets
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CMS_ASSET_PREFIX=$NEXT_PUBLIC_CMS_ASSET_PREFIX
COPY --from=dependencies /app/apps/public-cms/node_modules ./node_modules
COPY apps/public-cms ./
RUN npm run build:next

FROM node:22-alpine AS runner
WORKDIR /app/apps/public-cms
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8000
COPY --from=dependencies /app/apps/public-cms/node_modules ./node_modules
COPY --from=builder /app/apps/public-cms/package.json /app/apps/public-cms/package-lock.json ./
COPY --from=builder /app/apps/public-cms/src ./src
COPY --from=builder /app/apps/public-cms/scripts ./scripts
COPY --from=builder /app/apps/public-cms/.next/standalone ./
COPY --from=builder /app/apps/public-cms/.next/static ./.next/static
COPY --from=builder /app/apps/public-cms/public ./public
EXPOSE 8000
CMD ["sh", "-c", "node scripts/validate-production-env.mjs && npm run db:migrate && node server.js"]
