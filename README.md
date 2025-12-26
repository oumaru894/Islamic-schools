<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Liberia Islamic Schools Directory

A comprehensive directory application for Islamic schools across Liberia, built with React, Express, and SQLite.

## Features

- Browse and search Islamic schools by county, type, and location
- View detailed school profiles with contact information and features
- AI-powered chat assistant for school information
- Admin interface for managing school listings
- Database-backed with SQLite for persistent data storage

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Express.js, TypeScript
- **Database:** SQLite (better-sqlite3)
- **AI:** Google Gemini API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory (if it doesn't exist) and add your Gemini API key. Optionally set `VITE_API_URL` during local development; in production the frontend will fall back to a relative `/api` path so it will call the same origin as the site (recommended when deploying frontend and backend together):

```
GEMINI_API_KEY=your_api_key_here
# Optional during local development only. When empty the frontend will call /api on the same origin.
# Example for the deployed Render backend:
# VITE_API_URL=https://islamic-schools-1.onrender.com/api
```

### 4. Start the Backend Server

In a terminal, start the backend server:

```bash
cd server
npm run dev
```

The server will start on `http://localhost:4000` locally and automatically initialize the database with seed data if it's empty. When deployed (for example to Render), the frontend should call the backend using a relative `/api` path by default so you don't need to hard-code localhost. If you prefer to bake the deployed API URL into your build, set `VITE_API_URL` to `https://islamic-schools-1.onrender.com/api` before building.

### 5. Start the Frontend

In another terminal, start the frontend development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`.

## Database

This project now uses Postgres for persistence in production and development (see `server/README.md`). For local development you can run Postgres locally or provide a `DATABASE_URL` pointing to a hosted Postgres instance.

- To manually seed the database: `cd server && npm run seed`

### Migration caution

When running against an existing Postgres database, review migrations and back up data before applying schema changes.

## Project Structure

```
.
├── components/          # React components
├── pages/              # Page components
├── services/           # API service functions
├── server/             # Backend Express server
│   ├── src/
│   │   ├── database.ts # Database setup and schema
│   │   ├── seed.ts     # Database seeding script
│   │   ├── schoolService.ts # School data service layer
│   │   └── index.ts    # Express server entry point
│   └── data/           # SQLite database files
└── types.ts            # TypeScript type definitions
```

## API Endpoints

- `GET /api/schools` - List all schools
- `GET /api/schools/:id` - Get a single school
- `POST /api/schools` - Create a new school
- `PUT /api/schools/:id` - Update a school
- `DELETE /api/schools/:id` - Delete a school
- `GET /api/search?q=term` - Search schools

## View your app in AI Studio

https://ai.studio/apps/drive/1MZGQzBLBQwJul-956sKf3iX0Ct_XxKg6

## Docker runtime (Postgres)

The project Dockerfile supports running the server and serving the built frontend. The image accepts a build-time ARG `DATABASE_URL` which is set as the runtime `DATABASE_URL` environment variable.

Build the image (you can pass your own DATABASE_URL at build time):

```bash
docker build --build-arg DATABASE_URL="postgresql://postgres:..." -t schools-directory:latest .
```

Recommended: do not bake secrets into the image. Instead pass the DB URL at runtime:

```bash
docker run -p 4000:4000 -e DATABASE_URL="postgresql://postgres:..." schools-directory:latest
```

This will start the API on port 4000. Health check: GET /health

