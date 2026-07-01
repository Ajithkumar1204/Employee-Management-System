# 🏢 Employee Management System (EMS)

A production-grade, full-stack Employee Management System built with **Spring Boot 3** and **React (Vite)**, designed to demonstrate enterprise software architecture patterns suitable for Java Full Stack Developer interviews.

---

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Default Credentials](#default-credentials)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Security Model](#security-model)

---

## Tech Stack

**Backend:** Java 17 · Spring Boot 3 · Spring Security · Spring Data JPA · Hibernate · JWT (JJWT) · MySQL 8 · Maven · Lombok · SpringDoc OpenAPI · Apache POI

**Frontend:** React 18 (Vite) · React Router 6 · Axios · React Hook Form · React Toastify · Recharts · Bootstrap 5 · React-Bootstrap

---

## Features

### Authentication & Authorization
- JWT-based stateless authentication with refresh tokens
- BCrypt password hashing (strength 12)
- Role-based access control: `ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`
- Forgot/reset password flow, change password
- Auto token refresh on expiry (Axios interceptor)

### Employee Management
- Full CRUD with backend + frontend validation
- Search (name/email/code), filter (department/status), sort, pagination
- Profile photo upload (5MB limit, JPEG/PNG/GIF/WebP)
- Excel export (Apache POI)
- Auto-generated employee codes (`EMP00001`, `EMP00002`, ...)

### Department Management
- Full CRUD, department head assignment, employee count tracking
- Prevents deletion of departments with assigned employees

### Dashboard
- KPI cards: total/active/inactive/on-leave employees, department count
- Charts (Recharts): employees by department (bar), gender ratio (pie), monthly joining trend (line)
- Recent employees table

### Enterprise Features
- Global exception handling with consistent `ApiResponse<T>` wrapper
- Audit logging on all create/update/delete operations
- Dark mode toggle (persisted to localStorage)
- Responsive layout (sidebar, topbar, breadcrumbs)
- Loading skeletons, spinners, toast notifications

---

## Architecture

The backend follows a strict **layered architecture**:

```
Controller  →  Service (interface + impl)  →  Repository  →  Database
     ↓               ↓
   DTOs          Entities (mapped via Mapper classes)
```

**Design principles applied:**
- **Single Responsibility** — each class has one reason to change (e.g., `User` handles auth, `Employee` handles HR data — kept separate)
- **DTO Pattern** — entities are never exposed directly via API; `EmployeeRequest`/`EmployeeResponse` control the contract
- **Consistent API responses** — every endpoint returns `ApiResponse<T>`; paginated endpoints wrap content in `PagedResponse<T>`
- **Centralized exception handling** — `GlobalExceptionHandler` converts all exceptions to structured JSON
- **Auditability** — `BaseEntity` auto-populates `createdAt/updatedAt/createdBy/updatedBy` via Spring Data JPA auditing

---

## Project Structure

```
ems/
├── backend/
│   ├── src/main/java/com/ems/
│   │   ├── config/          # Security, CORS, Swagger, JPA Auditing, DataInitializer
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/
│   │   │   ├── request/     # Input DTOs (validated)
│   │   │   └── response/    # Output DTOs
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Custom exceptions + GlobalExceptionHandler
│   │   ├── mapper/          # Entity <-> DTO conversion
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/
│   │   │   ├── jwt/         # JwtUtils, AuthTokenFilter, AuthEntryPointJwt
│   │   │   └── service/     # UserDetailsImpl, UserDetailsServiceImpl
│   │   └── service/         # Business logic (interfaces + impl)
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   └── src/
│       ├── api/              # Axios instance + API service modules
│       ├── components/
│       │   ├── auth/         # ProtectedRoute
│       │   ├── common/       # LoadingSpinner, Pagination, ConfirmModal, etc.
│       │   ├── dashboard/    # StatCard, Charts
│       │   ├── employee/     # EmployeeForm, EmployeeFormModal
│       │   ├── department/   # DepartmentFormModal
│       │   └── layout/       # Sidebar, Topbar, Breadcrumb, MainLayout
│       ├── context/          # AuthContext, ThemeContext
│       ├── pages/            # Route-level page components
│       └── styles/           # global.css (CSS variables, dark mode)
└── docs/
    └── database_schema.sql
```

---

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

### Backend Setup
```bash
cd backend

# Create the database (or let Hibernate auto-create it via ddl-auto=update)
mysql -u root -p -e "CREATE DATABASE ems_db;"

# Update credentials in src/main/resources/application.properties
#   spring.datasource.username=root
#   spring.datasource.password=your_password

mvn clean install
mvn spring-boot:run
```
Backend runs at `http://localhost:8080/api`
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

On first startup, `DataInitializer` automatically seeds:
- All 4 roles (ADMIN, HR, MANAGER, EMPLOYEE)
- A default admin account (see [Default Credentials](#default-credentials))

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` (Vite dev server proxies `/api` to `localhost:8080`)

---

## Default Credentials

| Role  | Email             | Password    |
|-------|-------------------|-------------|
| Admin | admin@ems.com     | Admin@123   |

> ⚠️ Change this password immediately in any non-local environment.

---

## API Documentation

Full interactive documentation via Swagger UI at `/api/swagger-ui.html`.

### Key Endpoint Groups
| Module      | Base Path        | Example Endpoints |
|-------------|-------------------|--------------------|
| Auth        | `/api/auth`       | `POST /login`, `POST /register`, `POST /refresh-token` |
| Employees   | `/api/employees`  | `GET /`, `POST /`, `PUT /{id}`, `GET /search`, `GET /export/excel` |
| Departments | `/api/departments`| `GET /`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| Dashboard   | `/api/dashboard`  | `GET /stats` |

All responses follow this structure:
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": { ... },
  "statusCode": 200,
  "timestamp": "2026-06-30T10:15:00"
}
```

---

## Database Design

See [`docs/database_schema.sql`](docs/database_schema.sql) for the full DDL and relationship documentation.

**Core relationships:**
- `User` ↔ `Role` — **Many-to-Many** (join table `user_roles`)
- `User` ↔ `Employee` — **One-to-One**
- `Department` ↔ `Employee` — **One-to-Many / Many-to-One**
- `User` ↔ `RefreshToken` — **One-to-One**

---

## Security Model

1. Client sends credentials to `/auth/login`
2. Server validates via `AuthenticationManager` → `UserDetailsServiceImpl`
3. On success: JWT access token (24h) + refresh token (7d, stored in DB) issued
4. Client stores tokens, attaches `Authorization: Bearer <token>` to all requests
5. `AuthTokenFilter` validates the JWT on every request and populates `SecurityContext`
6. `@PreAuthorize` annotations on controllers enforce role-based access
7. On 401 (expired token), Axios interceptor automatically calls `/auth/refresh-token` and retries the original request
8. Logout deletes the server-side refresh token record

---

## License
MIT License — built for educational and portfolio purposes.
