# File Manager Mobile App

Turborepo monorepo for a personal file manager: an **Express + MongoDB API** and an **Expo (React Native)** mobile client.

## Apps

| App | Path | Stack |
| --- | ---- | ----- |
| **API** (`filemanager`) | `apps/api` | Node.js, Express, MongoDB, Multer, JWT |
| **Mobile** (`mobile`) | `apps/mobile` | Expo SDK 57, Expo Router, React Query |

## Features

- **Auth** — signup, login, logout, refresh tokens, profile, password change, OTP password reset, Google OAuth (API)
- **Files & folders** — browse, upload (images / PDF / docs), rename, duplicate, delete, download/share
- **Favorites** — star files and folders
- **Dashboard** — storage usage and recent items
- **Vault** — PIN-protected private files/folders
- **Calendar** — browse items by created date
- **Profile & settings** — account info, username, password

## Prerequisites

- Node.js **≥ 24**
- npm **11+**
- [Docker](https://www.docker.com/get-started) (for MongoDB)
- Expo Go (or a development build) for the mobile app

## Quick start

### 1. Install

```bash
npm install
```

### 2. Configure env

**API** (`apps/api`):

```bash
cp apps/api/.env.example apps/api/.env
```

Set a real `JWT_SECRET`. Keep `MONGODB_URI=mongodb://localhost:27017/filemanager` for local Mongo in Docker.

**Mobile** (`apps/mobile`):

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

| Platform | `EXPO_PUBLIC_API_URL` |
| -------- | -------------------- |
| iOS simulator / web | `http://localhost:8080` |
| Android emulator | `http://10.0.2.2:8080` |
| Physical device | `http://<your-lan-ip>:8080` |

### 3. Run

From the monorepo root:

```bash
npm run dev
```

Starts MongoDB (`docker-compose.mongo.yml`), the API on **http://localhost:8080**, and Expo for the mobile app.

| Script | What it does |
| ------ | ------------ |
| `npm run dev` | Mongo + API + mobile |
| `npm run dev:api` | Mongo + API only |
| `npm run dev:mobile` | Expo only |
| `npm run db:up` / `db:down` | Start / stop Mongo |
| `npm run docker:up` / `docker:down` | Full API stack in Docker |
| `npm run lint` | Lint workspaces |
| `npm run check-types` | Typecheck workspaces |

## API

- Base URL: `http://localhost:8080`
- Health: `GET /api/health`
- Postman collection: `apps/api/postman_collection.json`
- Uploads are stored under `apps/api/uploads/` (gitignored)

More detail: [`apps/api/README.md`](apps/api/README.md)

## Mobile

```bash
cd apps/mobile
npm run dev      # expo start --tunnel
npm run android
npm run ios
npm run web
```

Long-press a file or folder for actions (rename, duplicate, favorite, vault, delete, etc.).

More detail: [`apps/mobile/README.md`](apps/mobile/README.md)

## Project layout

```
apps/
  api/       # Express Storage Management API
  mobile/    # Expo React Native client
```

## Notes

- Uploaded files live on disk under `apps/api/uploads/` and are not committed.
- If you previously ran the API in Docker as root, fix upload permissions before local nodemon can write (see `apps/api/server.js` startup check).
- Google OAuth and email OTP need valid credentials in `apps/api/.env`.
