# ---- Build stage ----
# Node 20 n'est plus maintenu (fin de vie avril 2026) : LTS 22, la version avec laquelle le site est developpe
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Installation exacte du fichier de verrouillage (echoue si package-lock.json n'est plus a jour)
RUN npm ci

COPY . .

# Variables Vite : lues AU BUILD (le site est statique, rien n'est lu au demarrage du conteneur).
# Les passer en --build-arg (Dokploy : "Build Args" / compose `build.args`). Une variable non
# fournie n'est pas definie : Vite retombe alors sur le fichier .env du depot.
ARG VITE_API_BASE_URL
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_ENABLE_DEMO_DATA

RUN npm run build
# Outil de prerendu : version epinglee, hors package.json
RUN npm install --no-save tsx@4.19.2
RUN npm run build:seo

# ---- Production stage ----
FROM nginx:1.30-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# Modeles nginx : les variables ci-dessous y sont injectees au demarrage (en-tetes de securite)
COPY nginx/ /etc/nginx/templates/
ENV NGINX_ENVSUBST_FILTER="^(CSP_HEADER_NAME|API_ORIGIN|MEDIA_ORIGIN)\$"
# Report-Only : les violations sont signalees dans la console sans rien bloquer. Passer a
# Content-Security-Policy (variable d'environnement du conteneur) apres une semaine sans signalement.
ENV CSP_HEADER_NAME="Content-Security-Policy-Report-Only"
# Origine de l'API (ex. https://api-staging.model-technologie.com) et du stockage de fichiers
ENV API_ORIGIN=""
ENV MEDIA_ORIGIN=""

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
