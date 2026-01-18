from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Use NullPool to avoid keeping connections open in this dev environment
# preventing "MaxClientsInSessionMode" errors from Supabase
engine = create_engine(DATABASE_URL, poolclass=NullPool)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    from models import Base  
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")

def drop_tables():
    from models import Base 
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped successfully!")

if __name__ == "__main__":
    create_tables()