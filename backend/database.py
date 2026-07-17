import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to SQLite so the project runs with zero external setup.
# To use PostgreSQL instead, set DATABASE_URL, e.g.:
#   postgresql://postgres:password@localhost/pizza_delivery
#"sqlite:///./pizza_delivery.db"

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:kalharamax@localhost/pizza_delivery")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency that yields a request-scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
