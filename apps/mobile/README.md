# File Manager Mobile

Expo (React Native) client for the Storage Management API in `apps/api`.

## Prerequisites

1. API running at `http://localhost:8080` (see `apps/api/README.md` — Docker recommended).
2. Copy env: `cp .env.example .env` and set `EXPO_PUBLIC_API_URL` for your platform.

## Scripts

```bash
npm run dev      # expo start
npm run web
npm run android
npm run ios
npm run check-types
```

## Features

- Auth: signup, login, logout, refresh tokens, profile, password reset OTP
- Files & folders: browse, upload, rename, duplicate, delete, download/share
- Favorites, dashboard storage stats, vault PIN, calendar by date
- Google sign-in opens the API OAuth URL (requires Google credentials on the API)

Long-press a file or folder row for actions.
