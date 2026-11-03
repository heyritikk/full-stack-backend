# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Pehle sirf package files copy karo taaki npm ci ki layer cache ho jaye
COPY package.json package-lock.json ./
RUN npm ci

# Ab baaki source copy karke production build banao
COPY . .
RUN npm run build -- --configuration production

# ---------- Stage 2: runtime ----------
# nginx-unprivileged non-root (uid 101) chalta hai aur port 8080 sunta hai
FROM nginxinc/nginx-unprivileged:1.27-alpine AS final

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/planera-frontend/browser /usr/share/nginx/html

EXPOSE 8080
