# syntax=docker/dockerfile:1

# ---------- Stage 1: Build ----------
# Compile the TypeScript source into dist/.
FROM node:20-alpine AS build
WORKDIR /app

# Install pinned dependencies from the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Copy build config and source, then compile.
COPY tsconfig.json tsconfig.build.json ./
COPY src/ src/
RUN npm run build

# ---------- Stage 2: Runtime ----------
# Serve the static site as a non-root user on port 8080 (default for this image).
FROM nginxinc/nginx-unprivileged:alpine

# Explicitly disable long-lived caching so browsers always revalidate after a
# redeploy (serves the newest build without requiring a hard refresh).
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Static web root: index.html plus styles/, assets/, and the compiled dist/.
COPY index.html /usr/share/nginx/html/index.html
COPY styles/ /usr/share/nginx/html/styles/
COPY assets/ /usr/share/nginx/html/assets/
COPY --from=build /app/dist/ /usr/share/nginx/html/dist/

EXPOSE 8080
