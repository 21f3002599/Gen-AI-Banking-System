from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timezone

from database import get_db
from models import ApplicationTable, Customer, Account, User, AdharDetails, PanDetails
from pydantic_schemas import ApplicationCreate, ApplicationResponse

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(application: ApplicationCreate, db: Session = Depends(get_db)):
    db_application = ApplicationTable(**application.model_dump())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.get("/", response_model=List[ApplicationResponse])
def get_applications(skip: int = 0, limit: int = 100, status: str = None, db: Session = Depends(get_db)):
    query = db.query(ApplicationTable)
    if status:
        query = query.filter(ApplicationTable.application_status == status)
    applications = query.offset(skip).limit(limit).all()
    return applications


@router.get("/{application_no}", response_model=ApplicationResponse)
def get_application(application_no: uuid.UUID, db: Session = Depends(get_db)):
    application = db.query(ApplicationTable).filter(ApplicationTable.application_no == application_no).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.post("/{application_no}/approve")
def approve_application(application_no: uuid.UUID, db: Session = Depends(get_db)):
    application = db.query(ApplicationTable).filter(ApplicationTable.application_no == application_no).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.application_status != "pending":
        raise HTTPException(status_code=400, detail=f"Application is already {application.application_status}")

    # Create Customer
    # We need to check if customer already exists for this user? 
    # The PRD implies new customer creation.
    
    # Create Customer
    new_customer = Customer(
        user_id=application.user_id,
        firstname=application.firstname,
        lastname=application.lastname,
        address=application.address_line,
        city=application.city,
        district=application.district,
        state=application.state,
        pincode=application.pincode,
        country=application.country,
        aadhar_card_no=application.adhar_card_no,
        email=application.email,
        mobile_no=application.mobile_no,
        dob=application.dob,
        father_name=application.father_name
    )
    db.add(new_customer)
    db.flush() # To get customer_id

    # Create AdharDetails
    new_adhar_details = AdharDetails(
        customer_id=new_customer.customer_id,
        name=f"{application.firstname} {application.lastname}",
        dob=application.dob,
        gender=application.gender,
        adhar_no=application.adhar_card_no,
        address=f"{application.address_line}, {application.city}, {application.state}"
    )
    db.add(new_adhar_details)

    # Create PanDetails
    new_pan_details = PanDetails(
        customer_id=new_customer.customer_id,
        name=f"{application.firstname} {application.lastname}", # Or father name? Pan has name and father name.
        father_name=application.father_name,
        dob=application.dob,
        pan_no=application.pan_card_no
    )
    db.add(new_pan_details)

    # Create Account
    # Generate account no
    import random
    account_no = str(random.randint(1000000000, 9999999999))
    
    new_account = Account(
        account_no=account_no,
        customer_id=new_customer.customer_id,
        status_flag="active",
        account_type="savings",
        home_branch_code="BR001",
        home_branch_name="Mumbai", # Random city
        nominee="Not provided",
        current_balance=0.0,
        has_card=False,
        debit_card_no=None
    )
    db.add(new_account)

    # Update Application Status
    application.application_status = "approved"
    application.customer_id = new_customer.customer_id
    
    db.commit()
    
    return {"message": "Application approved", "customer_id": new_customer.customer_id, "account_no": account_no}


@router.post("/{application_no}/reject")
def reject_application(application_no: uuid.UUID, db: Session = Depends(get_db)):
    application = db.query(ApplicationTable).filter(ApplicationTable.application_no == application_no).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.application_status != "pending":
        raise HTTPException(status_code=400, detail=f"Application is already {application.application_status}")

    application.application_status = "rejected"
    db.commit()
    
    return {"message": "Application rejected"}
