from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from auth_routes import auth_router
from order_routes import order_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup so no separate init step is required.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Pizza Delivery API",
    version="2.0",
    description="An API for a Pizza Delivery Service",
    lifespan=lifespan,
)

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
