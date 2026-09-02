# Pizza Delivery API (updated)

FastAPI backend for the Pizza Delivery app, modernized to work with current
Python/FastAPI/Pydantic versions.

## What changed from the original

- **Removed `fastapi_jwt_auth`** (unmaintained, breaks on modern Pydantic) and
  replaced it with `python-jose` + `bcrypt` JWT handling in `auth_utils.py`.
- **Removed `sqlalchemy_utils.ChoiceType`** in favor of plain SQLAlchemy/Python
  `Enum`s (`PizzaSize`, `OrderStatus` in `models.py`) — one less dependency.
- **SQLite by default** so the project runs instantly with zero setup. Set the
  `DATABASE_URL` env var to point at Postgres/MySQL/etc. if you want.
- **Fixed a real bug**: `signup` used to `return HTTPException(...)` instead of
  `raise`, so duplicate-user checks silently did nothing. Now raises properly.
- **Fixed a real bug**: any logged-in user could update/delete *any* order.
  Update/delete now check that the order belongs to the requester (staff can
  still manage all orders).
- **Request-scoped DB sessions** via FastAPI `Depends(get_db)` instead of one
  shared global `Session` object (which is not safe under concurrent requests).
- **CORS enabled** for the Vite dev server (`http://localhost:5173`) so the
  React frontend can call the API directly.
- Upgraded to **Pydantic v2** schemas and **SQLAlchemy 2.0** style.

### Latest additions

- **Server-side pricing**: orders now carry a `total_price`, computed from a
  fixed price table on the server (never trusted from the client).
- **Timestamps**: every order has a `created_at`.
- **Orders can only be edited/cancelled while `PENDING`** — once a staff
  member moves an order to `IN-TRANSIT` or `DELIVERED`, the customer can no
  longer change or cancel it.
- **Pagination + filtering** on `GET /orders/orders`: `skip`, `limit`, and
  `order_status` query params, returning `{ items, total, skip, limit }`.
- **Profile management**: `PATCH /auth/me` to change your email, and
  `POST /auth/change-password` to change your password (requires the current
  one).
- **Test suite** in `tests/test_api.py` covering signup/login, ownership
  rules, staff-only routes, and the new endpoints — run with `pytest`.

### Latest additions

- **Now connects to MySQL by default** (via `PyMySQL`, a pure-Python driver —
  no system `libmysqlclient` needed). SQLite is still available as an opt-in
  fallback for quick local testing.
- **`docker-compose.yml`** spins up MySQL + Adminer (a web DB browser) with
  one command — see Setup below.
- **`.env` support** (`python-dotenv`) — copy `.env.example` to `.env` and
  fill in your MySQL credentials instead of exporting env vars by hand.
- **Startup retry logic**: if MySQL isn't ready yet when the app starts, it
  retries a few times with a clear log message instead of crashing immediately.
- **Connection pooling tuned for MySQL** (`pool_pre_ping`, `pool_recycle`) so
  idle connections don't cause "MySQL server has gone away" errors.
- **Admin search**: `GET /orders/orders` now also accepts a `user_id` filter,
  used by the staff dashboard's search box.
- Server-side pricing: orders now carry a `total_price`, computed from a
  fixed price table on the server (never trusted from the client).
- Timestamps: every order has a `created_at`.
- Orders can only be edited/cancelled while `PENDING` — once a staff member
  moves an order to `IN-TRANSIT` or `DELIVERED`, the customer can no longer
  change or cancel it.
- Pagination + filtering on `GET /orders/orders`: `skip`, `limit`,
  `order_status`, and `user_id` query params, returning
  `{ items, total, skip, limit }`.
- Profile management: `PATCH /auth/me` to change your email, and
  `POST /auth/change-password` to change your password (requires the current
  one).
- Test suite in `tests/test_api.py` covering signup/login, ownership rules,
  staff-only routes, and the new endpoints — run with `pytest`.

## Setup

### Option A — MySQL via Docker (recommended)

```bash
cd backend
docker compose up -d          # starts MySQL on :3306 and Adminer on :8080
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # defaults already match docker-compose.yml
uvicorn main:app --reload
```

Adminer (a simple DB GUI) is now at `http://localhost:8080` — server
`mysql`, user `pizza`, password `pizzapass`, database `pizza_delivery`.

### Option B — MySQL you already have running

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env with your MySQL host/user/password/db
uvicorn main:app --reload
```

Make sure the database itself exists first, e.g.:
```sql
CREATE DATABASE pizza_delivery;
```
Tables are then created automatically on startup.

### Option C — SQLite (no MySQL needed, quick local testing)

```bash
cd backend
pip install -r requirements.txt
DATABASE_URL=sqlite:///./pizza_delivery.db uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, with interactive docs at
`http://127.0.0.1:8000/docs`.

Run the test suite (always uses its own throwaway SQLite file, regardless of
your `DATABASE_URL`):

```bash
pytest
```

## Environment variables (optional)

| Variable         | Default                              | Description                             |
|------------------|----------------------------------------|-------------------------------------------|
| `MYSQL_USER`     | `root`                                | MySQL username                            |
| `MYSQL_PASSWORD` | `password`                            | MySQL password                            |
| `MYSQL_HOST`     | `localhost`                           | MySQL host                                |
| `MYSQL_PORT`     | `3306`                                | MySQL port                                |
| `MYSQL_DB`       | `pizza_delivery`                      | MySQL database name                       |
| `DATABASE_URL`   | built from the `MYSQL_*` vars above    | Full SQLAlchemy URL; overrides everything |
| `JWT_SECRET_KEY` | (dev default, change in production)   | Secret used to sign JWTs                  |

## Endpoints

- `POST /auth/signup` — create a user
- `POST /auth/login` — returns `{ access, refresh }` tokens
- `GET  /auth/refresh?refresh=<token>` — get a fresh access token
- `GET  /auth/me` — current user's profile
- `PATCH /auth/me` — update your email
- `POST /auth/change-password` — change your password
- `POST /orders/order` — place an order (auth required)
- `GET  /orders/user/orders` — current user's orders (auth required)
- `GET  /orders/user/order/{id}` — one of the current user's orders
- `PUT  /orders/order/update/{id}` — update your own order (only while PENDING)
- `DELETE /orders/order/delete/{id}` — cancel your own order (only while PENDING)
- `GET  /orders/orders?order_status=&user_id=&skip=&limit=` — paginated, filterable list of all orders (staff only)
- `GET  /orders/orders/{id}` — any order by id (staff only)
- `PATCH /orders/order/update/{id}` — update order status (staff only)
