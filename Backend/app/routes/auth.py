import os
from datetime import datetime, timedelta, timezone
from hashlib import sha256

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

from database import get_db
from models import User
from pydantic_schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return sha256(plain_password.encode()).hexdigest() == password_hash


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {"sub": str(user.user_id), "email": user.email}
    access_token = create_access_token(token_payload, expires_delta=expires_delta)

    return TokenResponse(access_token=access_token, expires_in=int(expires_delta.total_seconds()))
