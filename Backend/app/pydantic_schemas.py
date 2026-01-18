from pydantic import BaseModel, EmailStr
import uuid
from datetime import date, datetime

class RoleCreate(BaseModel):
    role_name: str

class RoleResponse(BaseModel):
    model_config = {"from_attributes": True}  
    role_id: uuid.UUID
    role_name: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    mobile_no: str | None = None
    role_id: uuid.UUID | None = None


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    user_id: uuid.UUID
    email: str
    mobile_no: str | None
    role_id: uuid.UUID | None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class CustomerCreate(BaseModel):
    user_id: uuid.UUID
    firstname: str
    lastname: str
    address: str | None = None
    city: str | None = None
    district: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = None
    aadhar_card_no: str | None = None
    email: str | None = None
    mobile_no: str | None = None
    dob: date | None = None


class CustomerResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    customer_id: uuid.UUID
    user_id: uuid.UUID
    firstname: str
    lastname: str
    email: str | None
    mobile_no: str | None
    city: str | None
    address: str | None
    district: str | None
    state: str | None
    pincode: str | None
    country: str | None
    aadhar_card_no: str | None
    dob: date | None


class AccountCreate(BaseModel):
    account_no: str
    customer_id: uuid.UUID
    status_flag: str = "active"
    account_type: str
    home_branch_code: str | None = None
    home_branch_name: str | None = None
    nominee: str | None = None
    current_balance: float = 0.0
    has_card: bool = False
    debit_card_no: str | None =None


class AccountResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    account_id: uuid.UUID
    account_no: str
    customer_id: uuid.UUID
    status_flag: str
    account_type: str
    current_balance: float
    date_of_activation: datetime


class TransactionCreate(BaseModel):
    account_no: str
    is_other_party_foreign: bool = False
    other_party_acc_no: str | None = None
    other_foreign_party_acc_no: str | None = None
    amount: float
    mode_of_transaction: str
    reason_of_transaction: str | None = None


class TransactionResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    transaction_id: uuid.UUID
    account_no: str
    amount: float
    date: date
    time: datetime
    mode_of_transaction: str


class ApplicationCreate(BaseModel):
    user_id: uuid.UUID
    firstname: str
    lastname: str
    father_name: str | None = None
    address_line: str
    city: str
    district: str
    state: str
    pincode: str
    country: str
    adhar_card_no: str
    pan_card_no: str
    email: str
    mobile_no: str
    dob: date
    gender: str | None = None
    kyc_status: bool = False
    adhar_card_image_url: str
    pan_card_image_url: str
    customer_image_url: str | None = None
    application_status: str = "pending"


class ApplicationResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    application_no: uuid.UUID
    user_id: uuid.UUID
    firstname: str
    lastname: str
    father_name: str | None
    application_status: str
    email: str
    mobile_no: str
    address_line: str
    city: str
    district: str
    state: str
    pincode: str
    country: str
    adhar_card_no: str
    pan_card_no: str
    dob: date
    gender: str | None
    kyc_status: bool
    adhar_card_image_url: str
    pan_card_image_url: str
    customer_image_url: str | None


class AdharDetailsCreate(BaseModel):
    customer_id: uuid.UUID
    name: str
    dob: date
    gender: str
    adhar_no: str
    address: str


class AdharDetailsResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    adhar_entry_id: uuid.UUID
    name: str
    adhar_no: str


class PanDetailsCreate(BaseModel):
    customer_id: uuid.UUID
    name: str
    father_name: str
    dob: date
    pan_no: str


class PanDetailsResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    pan_entry_id: uuid.UUID
    name: str
    pan_no: str

