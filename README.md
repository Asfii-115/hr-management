# hr-management
A RESTful backend API for managing employees and attendance records, built with Node.js, TypeScript, Express, and PostgreSQL.

---

## Features

- **Authentication** — JWT-based login system for HR users
- **Employee Management** — Create, read, update, and delete employee records with optional photo uploads
- **Attendance Tracking** — Record and manage daily employee check-in data with upsert support
- **Monthly Reports** — Generate attendance summaries per employee, including late arrival counts
- **Input Validation** — All incoming data is validated using Joi schemas
- **Pagination & Search** — All list endpoints support pagination and name-based search/filtering

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL |
| Query Builder | Knex.js |
| Auth | JSON Web Tokens (JWT) |
| Validation | Joi |
| File Uploads | Multer |
| Password Hashing | bcryptjs |

---

## Project Structure

```
hr-management/
├── migrations/          # Database migration files
├── seeds/               # Seed file for default HR user
├── src/
│   ├── config/          # Database connection (Knex)
│   ├── controllers/     # Route handler logic
│   ├── middleware/       # Auth & file upload middleware
│   ├── routes/          # Express route definitions
│   ├── types/           # TypeScript type extensions
│   ├── validators/      # Joi validation schemas
│   └── app.ts           # App entry point
├── uploads/             # Uploaded employee photos (auto-created)
├── .env.example         # Environment variable template
├── knexfile.ts          # Knex configuration
└── tsconfig.json
```

---

## Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/download/) v14 or higher

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/Asfii-115/hr-management.git
cd hr-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and update it:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

UPLOAD_PATH=./uploads
```

### 4. Create the database

In **pgAdmin** or any PostgreSQL client, create a database named `hr_management`. Or via terminal:

```bash
psql -U postgres -c "CREATE DATABASE hr_management;"
```

### 5. Run migrations

```bash
npm run migrate
```

### 6. Seed the default HR user

```bash
npm run seed
```

This creates the following login:
- **Email:** `admin@company.com`
- **Password:** `admin123`

### 7. Start the server

```bash
npm run dev
```

The API will be running at `http://localhost:3000`

---

## API Endpoints

All endpoints except `/auth/login` require the header:
```
Authorization: Bearer <your_token>
```

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login and receive a JWT token |

### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | List all employees (supports `?page`, `?limit`, `?search`) |
| GET | `/employees/:id` | Get a single employee |
| POST | `/employees` | Create an employee (multipart form-data, optional `photo`) |
| PUT | `/employees/:id` | Update an employee (multipart form-data, optional `photo`) |
| DELETE | `/employees/:id` | Delete an employee and their attendance records |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/attendance` | List records (supports `?employee_id`, `?date`, `?from`, `?to`) |
| GET | `/attendance/:id` | Get a single record |
| POST | `/attendance` | Record check-in (upserts if same employee + date exists) |
| PUT | `/attendance/:id` | Update a record |
| DELETE | `/attendance/:id` | Delete a record |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/attendance?month=YYYY-MM` | Monthly attendance summary with late counts |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the server in development mode (with hot reload) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled production build |
| `npm run migrate` | Run all pending database migrations |
| `npm run migrate:rollback` | Rollback the last migration batch |
| `npm run seed` | Seed the database with the default HR user |
| `npm run lint` | Run ESLint on the source files |
| `npm run format` | Auto-format code with Prettier |
