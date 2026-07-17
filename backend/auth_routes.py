from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from schemas import SignUpModel, LoginModel, UserOut, TokenPair
from models import User
from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_subject_from_refresh_token,
)

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.get("/")
async def hello(current_user: User = Depends(get_current_user)):
    """Sample protected hello world route."""
    return {"message": f"Hello {current_user.username}"}


@auth_router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently logged-in user (used by the frontend)."""
    return current_user


@auth_router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup(user: SignUpModel, db: Session = Depends(get_db)):
    """
    ## Create a user
    Requires: `username`, `email`, `password`, `is_staff`, `is_active`
    """
    if db.query(User).filter(User.email == user.email).first() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with the email already exists")

    if db.query(User).filter(User.username == user.username).first() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with the username already exists")

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        is_active=user.is_active,
        is_staff=user.is_staff,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@auth_router.post("/login", response_model=TokenPair, status_code=status.HTTP_200_OK)
async def login(user: LoginModel, db: Session = Depends(get_db)):
    """
    ## Login a user
    Requires `username` and `password`, returns a token pair `access` and `refresh`.
    """
    db_user = db.query(User).filter(User.username == user.username).first()

    if db_user and verify_password(user.password, db_user.password):
        return TokenPair(
            access=create_access_token(db_user.username),
            refresh=create_refresh_token(db_user.username),
        )

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Username Or Password")


@auth_router.post("/token", response_model=TokenPair, include_in_schema=False)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2-compatible token endpoint (used by the Swagger 'Authorize' button)."""
    db_user = db.query(User).filter(User.username == form_data.username).first()

    if db_user and verify_password(form_data.password, db_user.password):
        return TokenPair(
            access=create_access_token(db_user.username),
            refresh=create_refresh_token(db_user.username),
        )

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Username Or Password")


@auth_router.get("/refresh")
async def refresh_token(refresh: str):
    """
    ## Create a fresh access token
    Requires a valid refresh token passed as a query param, e.g. `/auth/refresh?refresh=<token>`
    """
    subject = get_subject_from_refresh_token(refresh)
    return {"access": create_access_token(subject)}
