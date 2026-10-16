# secure-blog

Full-stack secure blogging application built with Spring Boot, Spring Security, JWT authentication, PostgreSQL, React and TypeScript.

## Backend

```bash
cd backend
mvn spring-boot:run
```

Environment variables:

- `SPRING_DATASOURCE_URL` (default `jdbc:postgresql://localhost:5432/secure_blog`)
- `SPRING_DATASOURCE_USERNAME` (default `postgres`)
- `SPRING_DATASOURCE_PASSWORD` (default `postgres`)
- `APP_JWT_SECRET` (base64-encoded secret)
- `APP_JWT_EXPIRATION_MS` (default `3600000`)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` if the backend is not running on `http://localhost:8080`.
