# ============================================================
# Plateforme BEE — Interface utilisateur Next.js
# ============================================================
# Stages :
#   developpement  → next dev (hot-reload, source montée en volume)
#   production     → next build + next start (image optimisée)
# ============================================================

# ------------------------------------------------------------
# Base commune
# ------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# ------------------------------------------------------------
# Stage : developpement
# ------------------------------------------------------------
FROM base AS developpement
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ------------------------------------------------------------
# Stage : construction (intermédiaire pour la prod)
# ------------------------------------------------------------
FROM base AS construction
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ------------------------------------------------------------
# Stage : production
# ------------------------------------------------------------
FROM node:22-alpine AS production
WORKDIR /app
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copier uniquement ce qui est nécessaire à l'exécution
COPY --from=construction /app/public ./public
COPY --from=construction /app/.next/standalone ./
COPY --from=construction /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
