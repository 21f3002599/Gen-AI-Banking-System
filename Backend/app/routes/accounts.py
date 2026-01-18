from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models import Account, Customer
from pydantic_schemas import AccountCreate, AccountResponse

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.post("/", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.customer_id == account.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer with id {account.customer_id} not found")
    
    db_account = Account(**account.model_dump())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


@router.get("/customer/{customer_id}", response_model=List[AccountResponse])
def get_customer_accounts(customer_id: uuid.UUID, db: Session = Depends(get_db)):
    accounts = db.query(Account).filter(Account.customer_id == customer_id).all()
    return accounts


@router.get("/{account_no}", response_model=AccountResponse)
def get_account(account_no: str, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.account_no == account_no).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account
