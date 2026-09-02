import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()  # reads a .env file in the backend folder, if present

# MySQL is the default database. Format:
#   mysql+pymysql://<user>:<password>@<host>:<port>/<database>
# Override any part via DATABASE_URL, or the individual MYSQL_* vars below.
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "password")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DB", "pizza_delivery")

DEFAULT_MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"

# Set DATABASE_URL to override entirely, e.g. to fall back to SQLite for quick
# local testing: DATABASE_URL=sqlite:///./pizza_delivery.db
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_MYSQL_URL)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine_kwargs = {"echo": False, "connect_args": connect_args}

# Pool tuning + auto-reconnect matters for MySQL, since idle connections get
# dropped by the server (`MySQL server has gone away` otherwise).
if DATABASE_URL.startswith("mysql"):
    engine_kwargs.update(pool_pre_ping=True, pool_recycle=280)

engine = create_engine(DATABASE_URL, **engine_kwargs)

Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency that yields a request-scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
