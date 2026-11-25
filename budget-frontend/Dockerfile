# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ---------- Stage 2: runtime ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS final

# Security fix: Alpine packages latest version pe update karo
RUN apk update && apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/planera-frontend/browser /usr/share/nginx/html

EXPOSE 8080