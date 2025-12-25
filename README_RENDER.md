Render deployment notes

This repo builds a frontend (Vite) and a TypeScript Express server which serves the built frontend and a REST API.

Recommended: Deploy with Render using the Dockerfile in the repo root.

Steps (Docker service)
1. Push your code to GitHub.
2. On Render (https://render.com), create a new Web Service.
3. Choose "Docker" for the environment and connect your GitHub repository.
4. For the build, Render will use the Dockerfile at the repo root. The Dockerfile is multi-stage and produces a runtime image that serves both frontend and API.
5. Environment variables to set in Render:
   - NODE_ENV=production
   - JWT_SECRET (or other secrets used by your app)
   - PORT (Render injects a port automatically; the server reads process.env.PORT)
6. Persistent storage (if using SQLite): Render allows mounting a disk to `/server/data` when creating a service. Use that to persist the SQLite file.

Non-Docker option (Build & Start)
- You can also let Render build without Docker by configuring the service build and start commands:
  - Build command: npm run build
  - Start command: npm start
  - Note: native modules that require compilation (better-sqlite3) might fail unless Render provides build tools; Docker approach is safer.

Health checks
- A `/health` endpoint has been added to the server to allow Render to check readiness.

Post-deploy checks
- Visit the service URL Render provides and check `/` (frontend) and `/api/schools`.
- If using SQLite, confirm the database file exists in the mounted volume `/server/data`.

Recommendations
- For production, prefer a managed Postgres instance and set `DATABASE_URL` in the service environment. Migrate schema and use `DATABASE_URL` in place of SQLite.

Troubleshooting
- If the build fails due to native module compilation, use Docker deployment (the Dockerfile installs build tools).

Local testing commands

```bash
# build image
sudo docker build -t islamic-schools:prod .
# run image
sudo docker run --rm -p 4000:4000 --name islamic-prod islamic-schools:prod
```
