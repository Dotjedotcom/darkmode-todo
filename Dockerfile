# Multi-stage build for Vite + React app

FROM node:20-alpine AS builder
WORKDIR /app

# Enable Corepack and install Yarn CLI
RUN corepack enable \
  && corepack prepare yarn@4.10.2 --activate

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Build the app
COPY . .
RUN yarn build

# Production image
FROM nginx:1.27-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
