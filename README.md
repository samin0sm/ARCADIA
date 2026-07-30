# Gaming Event Platform — Backend MVP

## Run

1. Start MySQL. The default connection creates the `gaming_events` database automatically; alternatively, create it yourself.
2. Set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and a secure `JWT_SECRET` (at least 32 bytes). Java 17 or newer is supported.
3. Run `mvn spring-boot:run`.

Flyway applies the schema and sample accounts automatically. API docs are at `/swagger-ui.html`.

Sample password for seeded users: `Password123!`.

## Frontend

From `frontend`, run `npm install` once and then `npm run dev`. The UI opens at `http://localhost:5173` and calls the API at `http://localhost:8080/api` by default. To use another API address, create `frontend/.env` with `VITE_API_URL=http://your-host:port/api`.
