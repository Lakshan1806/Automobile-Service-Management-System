# File: project/user/app-customer-web/Dockerfile

# --- Stage 1: Dependencies ---
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# --- Stage 2: Builder ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# These ARGs will be passed in from docker-compose
ARG NEXT_PUBLIC_AUTHENTICATION_SERVICE_API_URL
ARG NEXT_PUBLIC_USER_SERVICE_API_URL
ARG NEXT_PUBLIC_APPOINTMENT_SERVICE_API_URL
ARG NEXT_PUBLIC_LOCATION_SERVICE_API_URL

# Set ENV vars for the build process
ENV NEXT_PUBLIC_AUTHENTICATION_SERVICE_API_URL=$NEXT_PUBLIC_AUTHENTICATION_SERVICE_API_URL
ENV NEXT_PUBLIC_USER_SERVICE_API_URL=$NEXT_PUBLIC_USER_SERVICE_API_URL
ENV NEXT_PUBLIC_APPOINTMENT_SERVICE_API_URL=$NEXT_PUBLIC_APPOINTMENT_SERVICE_API_URL
ENV NEXT_PUBLIC_LOCATION_SERVICE_API_URL=$NEXT_PUBLIC_LOCATION_SERVICE_API_URL

RUN npm run build

# --- Stage 3: Runner ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]