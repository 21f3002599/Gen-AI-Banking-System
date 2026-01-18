from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from sqlalchemy.orm import Session
from sqlalchemy import text

from database import create_tables, get_db , drop_tables
from routes import roles, users, customers, accounts, transactions, auth, applications, chatbot

app = FastAPI(
    title="Banking API",
    description="API for banking operations with Supabase PostgreSQL",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Include routers
app.include_router(roles.router)
app.include_router(users.router)
app.include_router(customers.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(chatbot.router)


# Tables are already created, commenting this out to prevent connection exhaustion
# create_tables()


@app.get("/")
def read_root():
    return {
        "message": "Banking API with SQLAlchemy and Supabase",
        "status": "active"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)