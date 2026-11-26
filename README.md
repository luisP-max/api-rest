# Project & Task Management REST API

A RESTful API built with **NestJS**, **TypeORM**, **PostgreSQL**, and **Docker** to manage projects and their associated tasks (1:N relationship). Includes input validation, exception handling, unit tests, Swagger documentation, and a CI/CD pipeline deploying to **Azure App Service** via **GitHub Actions**.

---

## Tech Stack

- **Framework:** NestJS (Node.js + TypeScript)
- **Database & ORM:** PostgreSQL + TypeORM
- **Containerization:** Docker & Docker Compose
- **Validation & Docs:** `class-validator`, `class-transformer`, Swagger (`@nestjs/swagger`)
- **Testing:** Vitest
- **Cloud & CI/CD:** Azure App Service, Azure Database for PostgreSQL, GitHub Actions

---

## Key Features

- **Projects Management:** Full CRUD, date range validation (`endDate >= startDate`), project progress percentage calculation based on completed tasks, and deletion protection if pending tasks exist.
- **Tasks Management:** Full CRUD, due date validation within project boundaries, filtering by `status` and `priority`, querying tasks by project, dedicated status update endpoint, and querying overdue incomplete tasks.
- **Interactive API Documentation:** Available at `/api/docs` via Swagger UI.

---

## API Endpoints

### Projects (`/projects`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects` | List all projects with their tasks |
| `GET` | `/projects/:id` | Get a single project by ID |
| `GET` | `/projects/:id/progress` | Calculate project completion percentage |
| `PATCH` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Delete a project (blocked if it has `PENDING` tasks) |

### Tasks (`/tasks`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/tasks` | Create a new task assigned to a project |
| `GET` | `/tasks` | List all tasks (supports `?status=` and `?priority=` filters) |
| `GET` | `/tasks/overdue` | List overdue tasks that are not `COMPLETED` |
| `GET` | `/tasks/project/:projectId` | List all tasks belonging to a specific project |
| `GET` | `/tasks/:id` | Get a single task by ID |
| `PATCH` | `/tasks/:id` | Update a task |
| `PATCH` | `/tasks/:id/status` | Update only the status of a task |
| `DELETE` | `/tasks/:id` | Delete a task |

---

## Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com
cd api-rest
```

### 2. Configure environment variables
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=project_management_db
```

### 3. Start PostgreSQL with Docker
```bash
docker compose up -d
```

### 4. Install dependencies and run the API
```bash
npm install
npm run start:dev
```

Once running, open Swagger UI in your browser at:
**`http://localhost:3000/api/docs`**

---

## Running Unit Tests

```bash
npm run test
```

---

## Deployment & CI/CD

Every push to the `main` branch triggers the **GitHub Actions** workflow (`.github/workflows/ci-cd.yml`), which runs unit tests, builds the TypeScript application, and deploys the artifact to **Azure App Service**.
