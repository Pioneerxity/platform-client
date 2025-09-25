# === Builder Stage ===
FROM node:20-alpine AS builder

WORKDIR /app

ARG NODE_ENV=production

# note: havent use this arg yet
#ARG OPENAI_API_KEY

ENV NODE_ENV=$NODE_ENV
#ENV OPENAI_API_KEY=$OPENAI_API_KEY

COPY package*.json ./

RUN npm ci --include=dev && npm cache clean --force

COPY . .

RUN npm run build

# === Production Stage ===
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built app from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]