# Guide de mise en production — MIWAI

## Table des matières
1. [Modifications de code obligatoires](#1-modifications-de-code-obligatoires)
2. [Variables d'environnement de production](#2-variables-denvironnement-de-production)
3. [Environnement Docker (recommandé)](#3-environnement-docker-recommandé)
4. [Environnement Nginx + PM2 (VPS Ubuntu)](#4-environnement-nginx--pm2-vps-ubuntu)
5. [Environnement Apache + PM2](#5-environnement-apache--pm2)
6. [Checklist finale](#6-checklist-finale)

---

## 1. Modifications de code obligatoires

Ces fichiers **doivent** être modifiés avant toute mise en prod.

---

### 1.1 `frontend/vite.config.ts`

Le proxy Vite ne fonctionne **qu'en développement**. En production le frontend est un build statique — le proxy est ignoré. Il faut ajouter la config `build` :

```ts
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,   // ← mettre true seulement si vous voulez déboguer en prod
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:4000',
        changeOrigin: true,
      },
    },
  },
});
```

> En prod, le frontend appelle l'API via l'URL définie dans `VITE_API_URL` (voir section 2).
> Si le frontend et le backend sont sur le même domaine (ex : nginx reverse proxy), laisser `VITE_API_URL` vide — axios utilisera `/api` en chemin relatif, ce qui est le comportement par défaut.

---

### 1.2 `backend/src/index.ts` — CORS

**Ligne 22** : en prod, restreindre CORS à votre domaine réel uniquement.

```ts
// Remplacer :
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://frontend:3000'],
  ...
}));

// Par :
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [FRONTEND_URL]                                          // ← domaine prod uniquement
    : [FRONTEND_URL, 'http://localhost:3000', 'http://frontend:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

### 1.3 `backend/src/routes/auth.ts` — Cookies sécurisés

**Aucune modification nécessaire** : la ligne 11 gère déjà automatiquement le flag `secure` selon l'environnement :

```ts
// Ligne 11 — déjà correct :
secure: process.env.NODE_ENV === 'production',  // ← true en prod (HTTPS obligatoire)
```

> ⚠️ Si votre prod tourne en **HTTP** (déconseillé), mettre `secure: false` temporairement.

---

### 1.4 `docker-compose.yml` — Retirer Adminer en prod

Supprimer le service `adminer` du `docker-compose.yml` pour ne pas exposer l'interface BDD en production :

```yaml
# Supprimer ces lignes en prod :
  adminer:
    image: adminer:latest
    ...
```

Ou créer un fichier `docker-compose.prod.yml` séparé (voir section 3).

---

### 1.5 `backend/Dockerfile` — Build compilé au lieu de ts-node

`ts-node` est lent et non adapté à la prod. Modifier le Dockerfile pour compiler TypeScript :

```dockerfile
# backend/Dockerfile (version production)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false

COPY . .
RUN npx prisma generate --schema=src/prisma/schema.prisma
RUN npm run build   # compile TypeScript → dist/

# Image finale légère
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=src/prisma/schema.prisma && node dist/index.js"]
```

> Vérifier que `tsconfig.json` a bien `"outDir": "dist"` et `"rootDir": "src"`.

---

### 1.6 `frontend/Dockerfile` — Nginx au lieu de Vite dev server

En prod, servir le build statique avec Nginx, pas le serveur Vite :

```dockerfile
# frontend/Dockerfile (version production)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# VITE_API_URL vide = appels relatifs /api (gérés par le reverse proxy)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Serveur Nginx pour les fichiers statiques
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Créer le fichier `frontend/nginx.conf` :

```nginx
# frontend/nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Toutes les routes React → index.html (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets buildés
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 2. Variables d'environnement de production

Copier `.env.example` en `.env` et remplir :

```bash
cp .env.example .env
```

```env
# .env — PRODUCTION

# ── Base de données ──────────────────────────────────────
POSTGRES_USER=miwai
POSTGRES_PASSWORD=<mot_de_passe_fort_32_chars>
POSTGRES_DB=miwai_db

# ── Backend ──────────────────────────────────────────────
# Générer avec : openssl rand -base64 64
JWT_SECRET=<secret_jwt_tres_long_et_aleatoire>
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://miwai.io          # ← votre vrai domaine

# ── Frontend ─────────────────────────────────────────────
# Laisser vide si nginx gère le proxy /api → backend
# Sinon mettre l'URL publique du backend :
VITE_API_URL=
```

> **Ne jamais committer `.env` dans git.** Vérifier que `.gitignore` contient bien `.env`.

---

## 3. Environnement Docker (recommandé)

### 3.1 Fichier `docker-compose.prod.yml`

Créer un fichier séparé pour la prod qui surcharge le docker-compose de base :

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  db:
    image: postgres:15-alpine
    container_name: miwai_db
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    # ⚠️ Ne pas exposer le port 5432 en prod (accès interne uniquement)
    expose:
      - "5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - miwai_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: miwai_backend
    restart: always
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 4000
      NODE_ENV: production
      FRONTEND_URL: ${FRONTEND_URL}
    expose:
      - "4000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - miwai_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ""          # vide = appels /api relatifs
    container_name: miwai_frontend
    restart: always
    ports:
      - "80:80"                   # ← exposé publiquement
    depends_on:
      - backend
    networks:
      - miwai_network

  # Reverse proxy Nginx (si vous voulez HTTPS avec Let's Encrypt)
  # Sinon supprimer ce service et gérer le SSL au niveau du serveur host
  nginx:
    image: nginx:alpine
    container_name: miwai_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certbot/conf:/etc/letsencrypt:ro
      - ./nginx/certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend
    networks:
      - miwai_network

volumes:
  postgres_data:

networks:
  miwai_network:
    driver: bridge
```

### 3.2 Lancer en prod

```bash
# Build et démarrage en prod
docker-compose -f docker-compose.prod.yml --env-file .env up -d --build

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend

# Mettre à jour après un git pull
git pull
docker-compose -f docker-compose.prod.yml up -d --build backend frontend
```

### 3.3 Config Nginx reverse proxy (optionnel, avec HTTPS)

```nginx
# nginx/nginx.prod.conf
server {
    listen 80;
    server_name miwai.io www.miwai.io;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name miwai.io www.miwai.io;

    ssl_certificate /etc/letsencrypt/live/miwai.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/miwai.io/privkey.pem;

    # Frontend (fichiers statiques servis par le container frontend)
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API → backend Node.js
    location /api/ {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 4. Environnement Nginx + PM2 (VPS Ubuntu)

Sans Docker — installation directe sur le serveur.

### 4.1 Prérequis

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# PM2 (gestionnaire de processus Node)
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# Certbot (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Base de données

```bash
sudo -u postgres psql
```
```sql
CREATE USER miwai WITH PASSWORD 'mot_de_passe_fort';
CREATE DATABASE miwai_db OWNER miwai;
GRANT ALL PRIVILEGES ON DATABASE miwai_db TO miwai;
\q
```

### 4.3 Backend

```bash
cd /var/www/miwai/backend

# Installer les dépendances
npm ci

# Générer le client Prisma
npx prisma generate --schema=src/prisma/schema.prisma

# Appliquer les migrations
DATABASE_URL="postgresql://miwai:mot_de_passe_fort@localhost:5432/miwai_db" \
  npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Seed initial
DATABASE_URL="..." npx ts-node --transpile-only src/seed.ts

# Compiler TypeScript
npm run build

# Lancer avec PM2
pm2 start dist/index.js --name miwai-backend
pm2 save
pm2 startup   # ← copier-coller la commande affichée
```

Créer le fichier de config PM2 `ecosystem.config.js` à la racine du backend :

```js
// backend/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'miwai-backend',
    script: 'dist/index.js',
    instances: 'max',         // utilise tous les CPUs disponibles
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgresql://miwai:mot_de_passe_fort@localhost:5432/miwai_db',
      JWT_SECRET: 'votre_secret_jwt',
      FRONTEND_URL: 'https://miwai.io',
    },
  }],
};
```

```bash
pm2 start ecosystem.config.js
```

### 4.4 Frontend

```bash
cd /var/www/miwai/frontend

# Build de production
npm ci
npm run build
# → génère frontend/dist/
```

### 4.5 Config Nginx

```bash
sudo nano /etc/nginx/sites-available/miwai
```

```nginx
# /etc/nginx/sites-available/miwai
server {
    listen 80;
    server_name miwai.io www.miwai.io;

    # Frontend — fichiers statiques buildés
    root /var/www/miwai/frontend/dist;
    index index.html;

    # SPA routing (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API → backend Node.js via PM2
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/miwai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# HTTPS avec Let's Encrypt
sudo certbot --nginx -d miwai.io -d www.miwai.io
```

---

## 5. Environnement Apache + PM2

### 5.1 Prérequis

```bash
sudo apt install -y apache2
sudo a2enmod proxy proxy_http rewrite headers
sudo systemctl restart apache2
```

Le backend tourne avec PM2 comme dans la section 4 (même procédure).

### 5.2 VirtualHost Apache

```bash
sudo nano /etc/apache2/sites-available/miwai.conf
```

```apache
# /etc/apache2/sites-available/miwai.conf
<VirtualHost *:80>
    ServerName miwai.io
    ServerAlias www.miwai.io

    # Frontend — fichiers statiques buildés
    DocumentRoot /var/www/miwai/frontend/dist

    <Directory /var/www/miwai/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # SPA routing — toutes les routes → index.html
    # Nécessite le fichier .htaccess ci-dessous
    FallbackResource /index.html

    # API → backend Node.js (PM2 sur port 4000)
    ProxyRequests Off
    ProxyPreserveHost On

    <Location /api/>
        ProxyPass http://localhost:4000/api/
        ProxyPassReverse http://localhost:4000/api/
        RequestHeader set X-Forwarded-Proto "https"
    </Location>

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/miwai_error.log
    CustomLog ${APACHE_LOG_DIR}/miwai_access.log combined
</VirtualHost>
```

```bash
# Activer le site
sudo a2ensite miwai.conf
sudo apache2ctl configtest
sudo systemctl reload apache2

# HTTPS avec Let's Encrypt
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d miwai.io -d www.miwai.io
```

### 5.3 Fichier `.htaccess` pour le SPA routing

Créer `frontend/public/.htaccess` (il sera copié dans `dist/` au build) :

```apache
# frontend/public/.htaccess
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

---

## 6. Checklist finale

Avant de mettre en ligne, vérifier chaque point :

### Sécurité
- [ ] `JWT_SECRET` généré avec `openssl rand -base64 64` (≥ 64 chars)
- [ ] `POSTGRES_PASSWORD` fort et unique
- [ ] `NODE_ENV=production` dans les variables d'env backend
- [ ] Le port PostgreSQL (5432) **non exposé** publiquement
- [ ] Adminer **supprimé** ou protégé par authentification
- [ ] HTTPS activé (Let's Encrypt)
- [ ] CORS restreint au domaine de prod uniquement

### Build
- [ ] `npm run build` réussi sur le frontend (vérifier la sortie `dist/`)
- [ ] `npm run build` réussi sur le backend (vérifier la sortie `dist/`)
- [ ] `prisma migrate deploy` appliqué sur la BDD de prod

### Fonctionnel
- [ ] Login avec `test@miwai.io` / `miwai2025` fonctionne
- [ ] Les routes React (`/forum`, `/formation`…) se rechargent sans erreur 404
- [ ] Les cookies `miwai_token` ont bien le flag `Secure` en prod (vérifiable dans les DevTools)

### Monitoring
```bash
# PM2 — voir les processus et les logs
pm2 status
pm2 logs miwai-backend

# Docker — voir les logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Nginx — vérifier les erreurs
sudo tail -f /var/log/nginx/miwai_error.log
```
