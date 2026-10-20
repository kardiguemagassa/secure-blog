# Secure Blog

A full-stack blog platform: a **Spring Boot** REST API secured with **Spring Security** and **JWT**, and a **React** frontend. Users register, log in and manage their own stories; administrators can moderate any story and manage user accounts.

Built as a hands-on project to practice authentication, authorization and API hardening, end to end.

## Tech stack

| Area | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 4 (Web MVC, Security, Data JPA, Validation) |
| Authentication | Spring Security OAuth2 Resource Server, JWT (HS256) |
| Password hashing | BCrypt |
| Database | PostgreSQL (runtime), H2 in PostgreSQL mode (tests) |
| Documentation | springdoc-openapi 3 / Swagger UI |
| Tests | JUnit 5, Mockito, AssertJ, MockMvc, `@DataJpaTest` |
| Build | Gradle |
| Frontend | React 19, TypeScript, Vite (see [Frontend](#frontend)) |

## Features

- **Registration and login**: account creation with input validation, JWT issued on login
- **Role-based access control**: `ROLE_USER` and `ROLE_ADMIN`
- **Posts**: public paginated reads; authenticated users create posts and edit or delete their own
- **Moderation**: admins can edit or delete any post
- **User administration**: list users, change roles, delete accounts (and their posts)
- **Consistent errors**: every error is returned as `application/problem+json` ([RFC 9457](https://www.rfc-editor.org/rfc/rfc9457))

## Getting started

### Prerequisites

- Java 21
- A running PostgreSQL instance
- Node.js, in the version given by `.nvmrc` (for the frontend)

### Configuration

The application reads its configuration from environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `POSTGRES_HOST` | yes | | Database host |
| `POSTGRES_PORT` | yes | | Database port |
| `POSTGRES_DB` | yes | | Database name |
| `POSTGRES_USERNAME` | yes | | Database user |
| `POSTGRES_PASSWORD` | yes | | Database password |
| `JWT_SECRET` | yes | | Base64-encoded signing key, **at least 256 bits** |
| `JWT_ISSUER` | no | `secure-blog` | `iss` claim written and validated |
| `JWT_EXPIRATION_MINUTES` | no | `60` | Token lifetime |
| `API_DOCS_ENABLED` | no | `true` | Enables Swagger UI and `/v3/api-docs` |

Generate a signing key:

```bash
openssl rand -base64 32
```

`JWT_SECRET` has no default on purpose: the application refuses to start without it, and rejects keys shorter than 256 bits.

### Run

Start the API:

```bash
cd api
./gradlew bootRun
```

The API is available at `http://localhost:8080` and the documentation at `http://localhost:8080/swagger-ui.html`.

Alternatively, put the variables in a `.env` file at the repository root (it is ignored by Git) and run `./run-api.sh`.

Then start the frontend in another terminal:

```bash
cd app
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

### Create the first administrator

Registration always creates a `ROLE_USER` account, and only an admin can promote another user. To bootstrap the first admin, register normally, then promote the account directly in the database:

```sql
UPDATE users SET role = 'ROLE_ADMIN' WHERE email = 'admin@example.com';
```

Log in again afterwards: the role is read from the JWT, so the existing token keeps the old role.

## API overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create an account |
| `POST` | `/api/auth/login` | Public | Get a JWT |
| `GET` | `/api/users/me` | Authenticated | Current user's profile |
| `GET` | `/api/posts` | Public | List posts (paginated) |
| `GET` | `/api/posts/{id}` | Public | Get a post |
| `GET` | `/api/posts/me` | Authenticated | Current user's posts |
| `POST` | `/api/posts` | Authenticated | Create a post |
| `PUT` | `/api/posts/{id}` | Owner or admin | Update a post |
| `DELETE` | `/api/posts/{id}` | Owner or admin | Delete a post |
| `GET` | `/api/admin/users` | Admin | List users (paginated) |
| `PATCH` | `/api/admin/users/{id}/role` | Admin | Change a user's role |
| `DELETE` | `/api/admin/users/{id}` | Admin | Delete a user and their posts |

Paginated endpoints accept `page`, `size` and `sort` query parameters.

### Example

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"S3curePassw0rd!"}'

# Log in and keep the token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"S3curePassw0rd!"}' | jq -r .accessToken)

# Create a post
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"My first post"}'
```

In Swagger UI, use the **Authorize** button and paste the token without the `Bearer` prefix.

### Status codes

| Code | Meaning |
|---|---|
| `400` | Invalid body, malformed JSON or invalid UUID; field errors are listed under `errors` |
| `401` | Missing, invalid or expired token, or invalid credentials |
| `403` | Authenticated but not allowed (not the owner, not an admin) |
| `404` | Resource not found |
| `409` | Email or username already in use, or forbidden admin self-action |

## Security design

**Authentication**
- Stateless JWT signed with HS256; the decoder validates signature, expiration and issuer.
- The `sub` claim holds the user's UUID: stable, and not personal data.
- Tokens carry no personal data: only the user ID (`sub`), the role and a unique token ID (`jti`).
- The role is carried in a `role` claim and mapped to Spring Security authorities.

**Authorization**
- URL-level rules in `SecurityConfig` (public reads, authenticated writes, admin area).
- Method-level rules with `@PreAuthorize`: ownership is checked by a dedicated `PostSecurity` bean.
- Defense in depth: the admin controller is protected both by URL rule and by `@PreAuthorize`.
- The author of a post always comes from the token, never from the request body.

**Hardening**
- Passwords hashed with BCrypt, bounded to 72 characters (BCrypt's input limit).
- Login runs BCrypt even for unknown emails, so response time does not reveal which accounts exist.
- Emails are normalized (trimmed, lower-cased) before storage and lookup.
- Input sizes are bounded and aligned with database column lengths.
- Request DTOs mask passwords in `toString()` to keep them out of logs.
- Error responses never expose SQL messages, stack traces or rejected values.
- An admin cannot change their own role or delete their own account, which prevents admin lockout.

## Testing

### Backend

```bash
cd api
./gradlew test
```

| Layer | Approach |
|---|---|
| Repositories | `@DataJpaTest` on H2, with flush and clear to test real database round-trips |
| Services | Unit tests with Mockito |
| Controllers | `@SpringBootTest` + MockMvc with real JWTs |

Controller tests cover the full authorization matrix (anonymous, owner, other user, admin) and token edge cases: expired, tampered signature, and valid token of a deleted user.

### Frontend

```bash
cd app
npm test
```

Vitest, Testing Library and jsdom. The tests cover the pure helpers (excerpt, permissions, pagination, server-side validation mapping) and the login form (validation, successful login, error messages, redirects).

## Frontend

React single-page application in `app/`, consuming the API.

### Stack

| Area | Technology |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite |
| Routing | React Router 8 |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod (rules mirror the backend DTOs) |
| Styling | CSS Modules and design tokens (CSS custom properties), light and dark themes |
| Fonts | Literata and Instrument Sans, self-hosted via `@fontsource` |
| Quality | ESLint, Prettier |

### How it reaches the API

In development, the Vite dev server proxies every `/api` request to `http://localhost:8080`. The browser only talks to one origin, so no CORS configuration is needed. The code always calls relative paths (`/api/...`); in production, a reverse proxy plays the same role.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and production build |
| `npm run lint` | ESLint |
| `npm run format` / `npm run format:check` | Format with Prettier / check formatting |
| `npm run preview` | Serve the production build locally |

### Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Latest stories (paginated card grid) |
| `/posts/:id` | Public | Story detail; edit and delete for the owner or an admin |
| `/login`, `/register` | Public | Authentication |
| `/posts/new`, `/posts/:id/edit` | Authenticated | Write and edit stories |
| `/me`, `/me/posts` | Authenticated | Profile and own stories |
| `/admin/users` | Admin | User list, role changes, account deletion |

### Security notes

- The current user is always loaded from `GET /api/users/me`; the frontend never trusts the JWT content.
- A `401` received with a token logs the user out; the query cache is cleared on logout, so no data leaks to the next user of the browser.
- Permission checks in the UI only hide controls; authorization is enforced by the API (`403` responses are handled and explained).
- User content is rendered as text only (React escaping, no `dangerouslySetInnerHTML`).
- Login shows the same message for an unknown email and a wrong password, consistent with the backend enumeration mitigation.
- Fonts are bundled with the app: no third-party font requests.

## Known limitations

- **Token storage.** The JWT is kept in `sessionStorage`, which scripts can read in case of XSS. Target design: an in-memory access token and a refresh token in an `httpOnly` cookie.
- **Role changes are not immediate.** The role is stored in the JWT, so a demoted user keeps their previous rights until the token expires (60 minutes by default). Possible mitigations: shorter-lived access tokens with refresh tokens, reading the role from the database on each request, or a token revocation list.
- **No refresh token.** Users log in again when the token expires.
- **Errors raised by the security filter chain** (missing or invalid token) return an empty body with a standard `WWW-Authenticate` header, rather than a `ProblemDetail` body.

## Project structure

```
api/src/main/java/com/kmgtechnologies/secureblog
├── config      # Security rules, JWT encoder/decoder, typed properties, OpenAPI
├── controller  # REST endpoints
├── dto         # Request and response records
├── entity      # JPA entities and Role enum
├── exception   # Global exception handler
├── repository  # Spring Data repositories
├── security    # JWT generation, ownership checks, current user helper
└── service     # Business logic

app/src
├── api         # Typed API client and one module per resource
├── auth        # Token storage, auth context, protected routes
├── components  # Layout, cards, forms, pagination, theme toggle
├── hooks       # Reusable hooks (page number in the URL)
├── lib         # Query client, formatting, permissions, form errors
├── pages       # One component per route
└── types       # TypeScript mirrors of the backend DTOs
```

## Git workflow

- `main`: stable releases
- `dev`: integration branch
- `feature/*`, `fix/*`, `refactor/*`, `docs/*`: one branch per change, merged into `dev` through a pull request

Commits follow [Conventional Commits](https://www.conventionalcommits.org/).
