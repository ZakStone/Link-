# Link Marketplace (MVP)

Marketplace locale pour référencer des artisans et permettre aux clients de les trouver et les contacter.

## Arborescence

```
/apps
  /api
  /mobile
/packages
  /shared
```

## Prérequis
- Node.js 18+
- Docker + Docker Compose
- Expo CLI (via `npx expo`)

## Installation

```bash
npm install
```

## Variables d'environnement

Copiez le fichier d'exemple :

```bash
cp apps/api/.env.example apps/api/.env
```

## Lancer la base de données + API

```bash
docker compose up -d
npm --workspace apps/api run prisma:generate
npm --workspace apps/api run prisma:migrate
npm --workspace apps/api run seed
npm --workspace apps/api run dev
```

API disponible sur `http://localhost:4000` et Swagger sur `http://localhost:4000/docs`.

## Lancer l'application mobile

```bash
cd apps/mobile
npx expo start
```

Pour pointer l'app mobile vers l'API locale, définissez :

```
EXPO_PUBLIC_API_URL=http://localhost:4000
```

Vous pouvez le définir dans votre shell avant de lancer Expo, ou dans un fichier `.env` local.

## Données seed

Le seed crée :
- 5 catégories figées
- 10 services figés
- 20 artisans répartis par catégorie
- 1 admin
- 1 client

Identifiants par défaut :
- Admin : `+221700000000` / `admin123`
- Client : `+221711111111` / `client123`
- Artisan : `+22178000000X` / `artisan123`

## Notes
- Auth JWT + refresh token stocké en DB.
- Validation Zod côté API.
- Rate limit sur le login.
