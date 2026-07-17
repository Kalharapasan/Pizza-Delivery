"""
Optional standalone script to create database tables.
Not required to run the app (main.py creates tables automatically on startup),
but handy if you want to set up the DB ahead of time.

Usage: python init_db.py
"""
from database import engine, Base
from models import User, Order

Base.metadata.create_all(bind=engine)
print("Database tables created.")
