# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ---------- Stage 2: runtime ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS final

# Root pe switch karo — sirf update ke liye
USER root
RUN apk update && apk upgrade --no-cache

# Wapas non-root pe aao (security best practice)
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/planera-frontend/browser /usr/share/nginx/html

EXPOSE 8080