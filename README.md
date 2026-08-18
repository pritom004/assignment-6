# Task API

A lightweight REST API built with **Express.js** that demonstrates CRUD (Create, Read, Update, Delete) operations with PostgreSQL database persistence. The project includes **Supabase Authentication**, **Bearer token authorization**, and **Swagger UI** for interactive API documentation generated from JSDoc comments.

---

## Features

- Express.js REST API
- PostgreSQL database with persistent storage
- CRUD operations for tasks
- Supabase Authentication (Sign up, Login)
- JWT Bearer token authorization
- Protected routes with middleware authentication
- Interactive Swagger documentation with Bearer auth
- Public and protected endpoints
- Docker and Docker Compose support
- Health check endpoint
- JSON request parsing

---

## Database Setup

This project uses **PostgreSQL** running inside a Docker container. Data persists across container restarts using a Docker named volume (`taskdata`).

### Option 1: Using Docker Compose (Recommended)

The easiest way to run both the API and database:

```bash
docker-compose up
```

This will start:
- PostgreSQL database on port 5432
- API server on port 3000

### Option 2: Manual Docker Setup

Start the Postgres container locally:

```bash
docker run --name taskdb -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=tasks -p 5432:5432 -v taskdata:/var/lib/postgresql/data -d postgres:17
```

---

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Get your Supabase credentials from your Supabase project settings.

---

## Requirements

- Node.js 18+ (recommended)
- npm
- Docker Desktop or Podman
- A database client like DBeaver, TablePlus, or `psql` CLI
- Supabase account (for authentication)
---

## Installation & Run

Clone the repository, install dependencies, and start the server:

```bash
npm install && npm start
```

After the server starts, visit:

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/docs

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Returns API information |
| GET | `/health` | Health check endpoint |
| GET | `/public/info` | Public information (no auth required) |
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login and get JWT tokens |

### Protected Task Endpoints (Require Bearer Token)

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/tasks` | Returns all tasks |
| POST | `/tasks` | Creates a new task |
| GET | `/tasks/:id` | Returns a task by ID |
| PUT | `/tasks/:id` | Updates an existing task |
| DELETE | `/tasks/:id` | Deletes a task |
| GET | `/protected/profile` | Read private profile data |

---

## Authentication

This API uses **Supabase Authentication** with JWT Bearer tokens.

### Sign Up

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response includes `access_token` and `refresh_token`.

### Using Bearer Token

Include the access token in the Authorization header for protected endpoints:

```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Example Responses

### Health Check

Request:

```bash
curl -i http://localhost:3000/health
```

Response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"ok"}
```

### Login Response

```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "your_refresh_token"
}
```

---

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/docs
```

The Swagger UI includes:
- Full endpoint documentation
- Request/response schemas
- Bearer token authorization support
- Interactive "Try it out" feature

![Swagger UI Screenshot](swagger-demo.PNG)

---

## Docker Support

### Build Docker Image

```bash
docker build -t task-api .
```

### Run with Docker Compose

```bash
docker-compose up
```

This will automatically:
- Build the API image
- Start PostgreSQL database
- Initialize the database
- Start the API server on port 3000

---

## Project Structure

```
.
├── index.js                    # Main application entry point
├── package.json               # Dependencies and scripts
├── Dockerfile                 # Container configuration
├── docker-compose.yml         # Docker Compose orchestration
├── supabase-client.js        # Supabase authentication client
├── config/
│   └── repository.js         # Database initialization
├── controllers/
│   └── task.controller.js    # Task business logic
├── middlewares/
│   └── auth.middleware.js    # JWT authentication middleware
└── routes/
    ├── auth.routes.js        # Authentication endpoints
    └── tasks.routes.js       # Task CRUD endpoints
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run the production server |
| `npm run dev` | Run with hot-reload (requires nodemon) |

---

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL database driver
- **@supabase/supabase-js** - Supabase authentication client
- **swagger-jsdoc** - OpenAPI/Swagger documentation generator
- **swagger-ui-express** - Swagger UI middleware
- **dotenv** - Environment variable management
- **nodemon** (dev) - Auto-reload during development

---

## License

This project is intended for learning and demonstration purposes.