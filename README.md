# CaisseMaya

Full-stack cash register and sales management application for a café.

## Tech Stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Backend  | Spring Boot 3+, Spring Data JPA, MySQL, Lombok    |
| Frontend | React, Vite, React Router, Axios, Bootstrap, Recharts |
| API Docs | Swagger / OpenAPI (springdoc)                     |

## Project Structure

```
mayaCaise/
├── backend/
│   └── src/main/java/command/CaiseMayaGroup/
│       ├── entity/          # JPA entities
│       ├── dto/             # Request/Response DTOs
│       ├── repository/      # Spring Data repositories
│       ├── service/         # Business logic
│       ├── controller/      # REST controllers
│       ├── mapper/          # Entity ↔ DTO mapping
│       ├── exception/       # Global exception handling
│       └── config/          # CORS, OpenAPI, seed data
├── backend/src/main/resources/
│   ├── application.properties
│   └── schema.sql           # MySQL schema reference
└── frontend/
    └── src/
        ├── api/             # Axios client & API services
        ├── components/      # Layout, Sidebar, Pagination
        └── pages/           # Dashboard, Categories, Products, Clients, Purchases
```

## Prerequisites

- Java 17+ (local dev only)
- Maven or `./mvnw` (local dev only)
- MySQL 8+ (local dev only)
- Node.js 18+ (local dev only)
- **Docker & Docker Compose** (recommended for full stack)

## Run with Docker (recommended)

From the project root:

```bash
docker compose up --build
```

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:8080/api |
| Swagger   | http://localhost:8080/swagger-ui.html |
| MySQL     | localhost:3307 (container uses 3306 internally) |

Stop containers:

```bash
docker compose down
```

Remove database volume (reset data):

```bash
docker compose down -v
```

Optional: copy `.env.example` to `.env` to customize `MYSQL_ROOT_PASSWORD`.

## Database Setup

1. Start MySQL and ensure credentials match `backend/src/main/resources/application.properties`:
   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/CaiseMaya?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=root@123
   ```
2. The database is created automatically on first run (`createDatabaseIfNotExist=true`).
3. Hibernate creates tables (`spring.jpa.hibernate.ddl-auto=create`).
4. Sample data is seeded on startup via `DataInitializer`.

## Running the Backend

```bash
cd backend
./mvnw spring-boot:run        # Linux/Mac
.\mvnw.cmd spring-boot:run    # Windows
```

- API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173

## API Endpoints

| Resource    | Endpoints |
|-------------|-----------|
| Categories  | `GET/POST /api/categories`, `PUT/DELETE /api/categories/{id}` |
| Products    | `GET/POST /api/products`, `GET /api/products/category/{id}`, `PUT/DELETE /api/products/{id}` |
| Clients     | `GET/POST /api/clients`, `GET /api/clients/search?name=`, `PUT/DELETE /api/clients/{id}` |
| Purchases   | `GET/POST /api/purchases`, `GET /api/purchases/client/{id}`, `GET /api/purchases/date?startDate=&endDate=` |
| Dashboard   | `GET /api/dashboard/stats` |

## Features

- **Category Management** — CRUD for Hot Drinks, Cold Drinks, Desserts, Snacks, etc.
- **Product Management** — CRUD with category filter, stock tracking, pagination
- **Client Management** — CRUD with name search and pagination
- **Purchase Management** — Record sales, auto-calculate total, decrease stock, filter by client/date
- **Dashboard** — KPI cards, sales charts, most sold products

## Notes

- `Product` includes a `stock` field (required for the "decrease stock after purchase" business rule).
- Change `spring.jpa.hibernate.ddl-auto` to `update` in production to preserve data across restarts.
