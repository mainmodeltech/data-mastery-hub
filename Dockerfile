# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Variables Vite : lues AU BUILD (le site est statique, rien n'est lu au demarrage du conteneur).
# Les passer en --build-arg (Dokploy : "Build Args" / compose `build.args`). Une variable non
# fournie n'est pas definie : Vite retombe alors sur le fichier .env du depot.
ARG VITE_API_BASE_URL
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_ENABLE_DEMO_DATA

RUN npm run build
RUN npm install -D tsx
RUN npm run build:seo

# ---- Production stage ----
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
