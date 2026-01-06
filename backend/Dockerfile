# Image Node officielle (stable)
FROM node:20-alpine

# Dossier de travail dans le container
WORKDIR /app

# Copier les dépendances
COPY package*.json ./

# Installer les dépendances (sans dev pour prod)
RUN npm ci --omit=dev

# Copier le reste du code
COPY . .

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Port exposé
EXPOSE 5000

# Commande de démarrage
CMD ["node", "server.js"]
