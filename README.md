# Forno &mdash; Pizza Delivery

A full-stack pizza delivery app: FastAPI + MySQL backend, React (Vite) frontend
with a light, warm color theme.

## Quickest start &mdash; full stack with Docker

```bash
docker compose up -d --build
```

This starts everything:

| Service   | URL                          |
|-----------|-------------------------------|
| Frontend  | http://localhost:5173         |
| Backend API + docs | http://localhost:8000/docs |
| MySQL     | localhost:3306                |
| Adminer (DB browser) | http://localhost:8080 &mdash; server `mysql`, user `pizza`, password `pizzapass`, database `pizza_delivery` |

Sign up (check "Register as kitchen staff" to get a staff account), then
place and track orders. Staff accounts see `/admin`.

## Running the pieces separately (for development)

See `backend/README.md` and `frontend/README.md` for running the API and the
Vite dev server directly on your machine (with hot reload), instead of inside
Docker.

## What's inside

- **`backend/`** &mdash; FastAPI + SQLAlchemy 2.0 + MySQL (via PyMySQL), JWT auth,
  pytest test suite, rate limiting on auth endpoints.
- **`frontend/`** &mdash; React + Vite, light color theme, order placement with
  delivery address/notes, live order tracking, staff dashboard, profile
  management.

## Highlights

- Orders capture a delivery address and optional notes, with server-computed
  pricing and timestamps.
- Orders can only be edited or cancelled while still `PENDING`.
- Staff dashboard: paginated order list, status filter, search by user ID.
- Login/signup/change-password are rate-limited per IP.
- Full test coverage for auth, ownership rules, and the order lifecycle
  (`cd backend && pytest`).
