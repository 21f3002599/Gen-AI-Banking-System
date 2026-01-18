from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Transactions, Account
from pydantic_schemas import TransactionCreate, TransactionResponse

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    # Verify account exists
    account = db.query(Account).filter(Account.account_no == transaction.account_no).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Create transaction
    db_transaction = Transactions(**transaction.model_dump())
    db.add(db_transaction)
    
    # Update account balance (simplified - in production, use proper transaction handling)
    account.current_balance -= transaction.amount
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.get("/account/{account_no}", response_model=List[TransactionResponse])
def get_account_transactions(
    account_no: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transactions)
        .filter(Transactions.account_no == account_no)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return transactions
