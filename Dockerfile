# Multi-stage Dockerfile: build frontend with node, build server with node, produce small runtime image

# Stage 1: build frontend
FROM node:18-bullseye-slim AS frontend-build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json vite.config.ts ./
# Copy full project (dockerignore prevents unnecessary files) so Vite sees all files and nested imports
COPY . ./
RUN npm ci --silent
RUN npm run build

# Stage 2: build server
FROM node:18-bullseye-slim AS server-build
WORKDIR /server
COPY server/package.json server/package-lock.json server/tsconfig.json ./
COPY server/src/ ./src/
# Install system build tools in case native modules need to be compiled
RUN apt-get update && apt-get install -y python3 build-essential g++ make libsqlite3-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dev dependencies so TypeScript compiler is available to build
RUN npm ci --include=dev --silent
RUN npm run build

# Remove dev dependencies to keep node_modules minimal for runtime
RUN npm prune --production --silent

# Final stage: runtime
FROM node:18-bullseye-slim AS runtime
WORKDIR /app
# copy server dist
COPY --from=server-build /server/dist ./server/dist
COPY --from=server-build /server/node_modules ./server/node_modules
# copy built frontend
COPY --from=frontend-build /app/dist ./dist
# Do not copy the server database into the image. The server will initialize data on first run
ARG DATABASE_URL="postgresql://postgres:krJELbRbVdFgRTnzOnIoGPoXbogUeEQT@shuttle.proxy.rlwy.net:53650/railway"
ENV DATABASE_URL=${DATABASE_URL}
ENV PORT=4000
EXPOSE 4000
CMD ["node", "server/dist/index.js"]



