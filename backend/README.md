# Pizza Delivery API (updated)

FastAPI backend for the Pizza Delivery app, modernized to work with current
Python/FastAPI/Pydantic versions.

## What changed from the original

- **Removed `fastapi_jwt_auth`** (unmaintained, breaks on modern Pydantic) and
  replaced it with `python-jose` + `passlib` JWT handling in `auth_utils.py`.
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

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, with interactive docs at
`http://127.0.0.1:8000/docs`. Tables are created automatically on startup
(SQLite file `pizza_delivery.db` in the backend folder).

## Environment variables (optional)

| Variable        | Default                              | Description                          |
|-----------------|---------------------------------------|---------------------------------------|
| `DATABASE_URL`  | `sqlite:///./pizza_delivery.db`       | SQLAlchemy connection string          |
| `JWT_SECRET_KEY`| (dev default, change in production)   | Secret used to sign JWTs              |

## Endpoints

- `POST /auth/signup` — create a user
- `POST /auth/login` — returns `{ access, refresh }` tokens
- `GET  /auth/refresh?refresh=<token>` — get a fresh access token
- `POST /orders/order` — place an order (auth required)
- `GET  /orders/user/orders` — current user's orders (auth required)
- `GET  /orders/user/order/{id}` — one of the current user's orders
- `PUT  /orders/order/update/{id}` — update your own order
- `DELETE /orders/order/delete/{id}` — delete your own order
- `GET  /orders/orders` — all orders (staff only)
- `GET  /orders/orders/{id}` — any order by id (staff only)
- `PATCH /orders/order/update/{id}` — update order status (staff only)
