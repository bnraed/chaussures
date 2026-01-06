# ---------- Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Dépendances
COPY package*.json ./
RUN npm ci

# Code source
COPY . .

# Variable API (injectée par docker-compose)
ARG VITE_API_ORIGIN
ENV VITE_API_ORIGIN=$VITE_API_ORIGIN

# Build Vite
RUN npm run build

# ---------- Serve ----------
FROM nginx:alpine

# Copier le build dans Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
