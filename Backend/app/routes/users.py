from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from hashlib import sha256


from database import get_db
from models import User, Roles
from pydantic_schemas import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Verify role exists if role_id is provided
    # Verify role exists if role_id is provided
    if user.role_id:
        role = db.query(Roles).filter(Roles.role_id == user.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail=f"Role with id {user.role_id} not found")
    else:
        # Default to customer role
        role = db.query(Roles).filter(Roles.role_name == "customer").first()
        if not role:
            raise HTTPException(status_code=500, detail="Default customer role not found in database")
        user.role_id = role.role_id


    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = sha256(user.password.encode()).hexdigest()
    
    user_dict = user.model_dump()
    user_dict.pop('password')
    user_dict['password_hash'] = password_hash
    
    db_user = User(**user_dict)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users
