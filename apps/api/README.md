# Storage Management API

A robust Node.js API for secure file storage, implementing folder management, file operations, Favorites, Dashboard, a secure Vault, and Calendar integration.

## Development (recommended)

Run **MongoDB in Docker** and the **API with nodemon** on the host.

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running
- Node.js (see root `package.json` engines)

### Setup

1. Copy env and set a real `JWT_SECRET` (not the placeholder):

   ```bash
   cp .env.example .env
   ```

   Keep `MONGODB_URI=mongodb://localhost:27017/filemanager` for local nodemon + Docker Mongo.

2. From the **monorepo root**:

   ```bash
   npm run dev
   ```

   This starts Mongo (`docker-compose.mongo.yml`), then Turbo `dev` (API nodemon + mobile Expo).

   Useful scripts from root:

   | Script | What it does |
   | ------ | ------------ |
   | `npm run db:up` | Start Mongo only |
   | `npm run db:down` | Stop Mongo |
   | `npm run dev` | Mongo + API + mobile |
   | `npm run dev:api` | Mongo + API only |
   | `npm run docker:up` | Full stack in Docker (API container + Mongo) |

3. API: `http://localhost:8080` · Mongo: `mongodb://localhost:27017/filemanager`

---

## Full Docker (API + Mongo)

```bash
# from apps/api, or: npm run docker:up (from root)
docker compose up --build
```
---

## 🧪 API Documentation & Testing

A comprehensive **Postman Collection** is included in this repository (`postman_collection.json`).

### Importing into Postman

1.    Open Postman.
2.    Click **Import** -> **File** -> Select `postman_collection.json`.
3.    The collection "Storage Management API" will appear.

### Testing Workflow

The collection is organized into **Phases** meant to be tested sequentially:

1.    **Phase 1: Foundation**: Verify server health.
2.    **Phase 2: Authentication**: Signup/Login (Automatically captures tokens).
3.    **Phase 3: User Profile**: Test profile updates and Password Reset (OTP flow).
4.    **Phase 4: Google OAuth**: Instructions included in the request description.
5.    **Phase 5-9**: File & Folder operations, Favorites, Dashboard.
6.    **Phase 10: Vault**: Test secure file storage with PIN.
7.    **Phase 11: Calendar**: **NEW** - Get files by date.
      - Set `custom_calendar_date` variable (e.g., `25-12-23`) to test specific dates.

### Collection Variables

The collection uses scripts to automatically manage variables like `auth_token`, `file_id`, etc. You rarely need to set these manually.

## 🔑 Environment Variables

| Variable               | Description                                 |
| ---------------------- | ------------------------------------------- |
| `PORT`                 | Server port (default: 8080)                 |
| `MONGODB_URI`          | MongoDB connection string                   |
| `JWT_SECRET`           | Secret key for signing JsonWebTokens        |
| `GOOGLE_CLIENT_ID`     | OAuth Client ID from Google Cloud Console   |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret                         |
| `SMTP_HOST`            | SMTP Server (e.g., smtp.gmail.com)          |
| `SMTP_USER`            | Email address for sending system emails     |
| `SMTP_PASS`            | App Password (not login password) for email |
