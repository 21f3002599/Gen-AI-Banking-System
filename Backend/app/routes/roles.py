from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models import Roles
from pydantic_schemas import RoleCreate, RoleResponse

router = APIRouter(prefix="/roles", tags=["roles"])


@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    db_role = Roles(**role.model_dump())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


@router.get("/", response_model=List[RoleResponse])
def get_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = db.query(Roles).offset(skip).limit(limit).all()
    return roles
