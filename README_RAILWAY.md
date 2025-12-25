Railway deployment

This repository builds a frontend (Vite) and a TypeScript Express server that serves the built frontend and a REST API.

Recommended (Docker) — preferred for parity with local build
1. Push this repository to GitHub.
2. On Railway, create a new project and connect your GitHub repo.
3. Choose the Docker deployment option (Railway will use the Dockerfile in the repo root).
4. Railway will build the multi-stage Docker image and run the container. The server listens on the PORT environment variable (Railway sets this automatically).
5. For persistent data:
   - Option A (quick): Enable Railway "Persistent Storage" and mount it to `/server/data` so the SQLite file persists.
   - Option B (recommended long-term): Migrate from SQLite to a managed Postgres database (more robust for production).

Non-Docker deployment (Railway buildpacks)
1. If you prefer Railway to build without Docker, set these in the Railway service settings:
   - Build command: npm run build
   - Start command: npm start
   Railway will run `npm ci` and `npm run build` then `npm start` which executes `node server/dist/index.js`.

Notes & Checklist
- The server reads `process.env.PORT` (already supported).
- If you use Docker, the provided `Dockerfile` produces a single runtime image that serves both API and frontend.
- Consider migrating the data layer to Postgres for scalability and reliability; if you stay with SQLite, ensure persistent storage is configured in Railway.
- Environment variables to set in Railway: any JWT secret or configuration used by the server (check `server/.env` or your code). Set `NODE_ENV=production` if needed.

Troubleshooting
- If the frontend fails to build on Railway, ensure the project contains `tsconfig.json` and `vite.config.ts` at the repo root (they are expected by the Dockerfile). The Dockerfile already copies the full repo for the frontend build.
- If native modules fail during build (e.g., better-sqlite3), prefer Docker deployment (our Docker image installs build tools) or use a managed DB.

Quick deploy commands (local testing)

Build image locally:

```bash
sudo docker build -t islamic-schools:prod .
```

Run locally (map port 4000):

```bash
sudo docker run --rm -p 4000:4000 --name islamic-prod islamic-schools:prod
```

That's it — use Railway's UI to connect the repo and deploy via the Dockerfile for the smoothest experience.
