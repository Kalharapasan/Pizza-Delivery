import time

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from sqlalchemy.exc import OperationalError

from database import engine, Base, DATABASE_URL
from limiter import limiter
from auth_routes import auth_router
from order_routes import order_router


def _create_tables_with_retry(retries: int = 5, delay_seconds: float = 2.0):
    """
    MySQL may take a moment to accept connections (e.g. starting up in Docker).
    Retry table creation a few times before giving up with a clear error.
    """
    last_error = None
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError as exc:
            last_error = exc
            print(f"[startup] Database not ready yet (attempt {attempt}/{retries}): {exc.__class__.__name__}")
            time.sleep(delay_seconds)

    raise RuntimeError(
        f"Could not connect to the database at '{DATABASE_URL}' after {retries} attempts. "
        "Check that MySQL is running and DATABASE_URL / MYSQL_* env vars are correct."
    ) from last_error


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup so no separate init step is required.
    _create_tables_with_retry()
    yield


app = FastAPI(
    title="Pizza Delivery API",
    version="2.0",
    description="An API for a Pizza Delivery Service",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow the React frontend (Vite dev server) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(order_router)


@app.get("/")
async def root():
    return {"message": "Pizza Delivery API is running"}
