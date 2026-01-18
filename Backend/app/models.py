from sqlalchemy import Column, String, Float, Boolean, Date, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime, timezone
import uuid
import enum

class Base(DeclarativeBase):
    pass


class AccountStatusEnum(enum.Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"
    DORMANT = "dormant"
    CLOSED = "closed"


class ModeOfTransactionEnum(enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ATM = "atm"
    BRANCH = "branch"


class Roles(Base):
    __tablename__ = 'roles'
    
    role_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_name = Column(String,unique=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = 'user'
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    mobile_no = Column(String)
    role_id = Column(UUID(as_uuid=True), ForeignKey('roles.role_id'))

    role = relationship("Roles", back_populates="users")
    employees = relationship("Employee", back_populates="user")
    customers = relationship("Customer", back_populates="user")


class Employee(Base):
    __tablename__ = 'employee'
    
    employee_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.user_id'))
    name = Column(String)
    user = relationship("User", back_populates="employees")


class Customer(Base):
    __tablename__ = 'customer'
    
    customer_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.user_id'))
    firstname = Column(String)
    lastname = Column(String)
    father_name = Column(String)
    address = Column(String)
    city = Column(String)
    district = Column(String)
    state = Column(String)
    pincode = Column(String)
    country = Column(String)
    aadhar_card_no = Column(String)
    email = Column(String)
    mobile_no = Column(String)
    dob = Column(Date)


    user = relationship("User", back_populates="customers")
    adhar_details = relationship("AdharDetails", back_populates="customer")
    pan_details_rel = relationship("PanDetails", back_populates="customer")
    accounts = relationship("Account", back_populates="customer")


class AdharDetails(Base):
    __tablename__ = 'adhar_details'
    
    adhar_entry_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customer.customer_id'))
    name = Column(String)
    dob = Column(Date)
    gender = Column(String)
    adhar_no = Column(String, unique=True)
    address = Column(String)
    
    customer = relationship("Customer", back_populates="adhar_details")


class PanDetails(Base):
    __tablename__ = 'pan_details'
    
    pan_entry_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customer.customer_id'))
    name = Column(String)
    father_name = Column(String)
    dob = Column(Date)
    pan_no = Column(String, unique=True)
    
    customer = relationship("Customer", back_populates="pan_details_rel")


class Account(Base):
    __tablename__ = 'account'
    
    account_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_no = Column(String, unique=True, nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customer.customer_id'))
    status_flag = Column(String)  # Active/Blocked/Dormant/closed
    account_type = Column(String)
    home_branch_code = Column(String)
    home_branch_name = Column(String)
    nominee = Column(String)
    date_of_activation = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    current_balance = Column(Float, default=0.0)
    has_card = Column(Boolean, default=False)
    debit_card_no = Column(String)
    

    customer = relationship("Customer", back_populates="accounts")
    transactions = relationship("Transactions", back_populates="account", foreign_keys="[Transactions.account_no]")


class Transactions(Base):
    __tablename__ = 'transactions'
    
    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_no = Column(String, ForeignKey('account.account_no'))
    other_party_acc_no = Column(String, ForeignKey('account.account_no'))
    date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    amount = Column(Float)
    mode_of_transaction = Column(String)  # online(default)/offline/atm/branch
    reason_of_transaction = Column(String)
    

    account = relationship("Account", back_populates="transactions", foreign_keys=[account_no])


class ApplicationTable(Base):
    __tablename__ = 'application_table'
    
    application_no = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.user_id'))
    firstname = Column(String)
    lastname = Column(String)
    father_name = Column(String)
    address_line = Column(String)
    city = Column(String)
    district = Column(String)
    state = Column(String)
    pincode = Column(String)
    country = Column(String)
    adhar_card_no = Column(String)
    pan_card_no = Column(String)
    email = Column(String)
    mobile_no = Column(String)
    dob = Column(Date)
    adhar_card_image_url = Column(String)
    pan_card_image_url = Column(String)
    customer_image_url = Column(String)
    application_status = Column(String)  # pending/approved/rejected
    father_name = Column(String)
    gender = Column(String)
    kyc_status = Column(Boolean, default=False)
    

