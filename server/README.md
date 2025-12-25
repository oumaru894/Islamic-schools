# Server for Liberia Islamic Schools Directory

This Express + TypeScript server provides REST endpoints for managing Islamic schools data with a SQLite database backend.

## Quick Start

1. `cd server`
2. `npm install`
3. `npm run dev` (or `npm run seed` to seed the database manually)

The server defaults to port 4000. The database is automatically initialized and seeded on first startup if empty.

## Database

The server uses SQLite with `better-sqlite3`. The database file is stored in `server/data/schools.db`.

- The database is automatically initialized when the server starts
- If the database is empty, it will be automatically seeded with initial school data
- To manually seed the database: `npm run seed`

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/schools` — list all schools
- `GET /api/schools/:id` — get a single school by ID
- `POST /api/schools` — create a new school (JSON body)
- `GET /api/search?q=term` — search schools by name, location, or type

### Protected Endpoints (Authentication Required)
- `PUT /api/schools/:id` — update a school (requires authentication & school access)
- `DELETE /api/schools/:id` — delete a school (requires authentication & school access)
- `GET /api/schools/:id/users` — get all users for a school (requires authentication & school access)

### Authentication Endpoints
- `POST /api/auth/register` — register a new user
  ```json
  {
    "email": "admin@school.edu.lr",
    "password": "securepassword",
    "name": "John Doe",
    "role": "administrator",
    "school_id": "1"
  }
  ```
- `POST /api/auth/login` — login and get JWT token
  ```json
  {
    "email": "admin@school.edu.lr",
    "password": "securepassword"
  }
  ```
  Returns:
  ```json
  {
    "user": { "id": 1, "email": "...", "name": "...", "role": "...", "school_id": "1" },
    "token": "jwt-token-here"
  }
  ```
- `GET /api/auth/me` — get current user profile (requires authentication)
  - Headers: `Authorization: Bearer <token>`

## Authentication & Authorization

The system uses JWT (JSON Web Tokens) for authentication. Users must:
1. Register with an email, password, name, role, and school_id
2. Login to receive a JWT token
3. Include the token in the `Authorization` header for protected endpoints: `Authorization: Bearer <token>`

**User Roles:**
- `staff` — can manage their assigned school
- `administrator` — can manage their assigned school (same permissions as staff for now)

**Permissions:**
- Users can only update/delete schools they are assigned to (matching `school_id`)
- Users can view all schools (read-only)
- Only authenticated users can modify school data

## Database Schema

- `schools` — main school information
- `school_contacts` — contact information (email, phone, address)
- `school_features` — list of school features
- `school_leadership` — leadership members for each school
- `users` — staff/administrator accounts with authentication

All data is persisted in SQLite and survives server restarts.

## Environment Variables

- `JWT_SECRET` — Secret key for JWT tokens (default: 'your-secret-key-change-in-production')
  - **Important:** Change this in production!
