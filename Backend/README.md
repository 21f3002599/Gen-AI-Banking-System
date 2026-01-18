---

### Part 2: Backend README
**Location:** `/backend/README.md`

```markdown
# Vault42 Backend - API & AI Logic ⚙️

This directory contains the core logic for the Vault42 Banking System, including RESTful APIs, Database Management, and GenAI integrations.

## 🏗️ Architecture
The backend is built using **FastAPI** for high-performance asynchronous execution. It follows a modular design:
- **Auth Module:** JWT-based secure stateless authentication.
- **KYC Module:** Integration with Gemini 2.5 for OCR and DeepFace for liveness.
- **Transaction Module:** Real-time stream processing and ML-based fraud scoring.
- **Analyst Module:** Management APIs for fraud investigators.

## 🔧 Installation & Setup

### Prerequisites
- Python 3.12+
- PostgreSQL (or Supabase URL)
- Google Gemini API Key

### Setup Steps
1. **Clone the repo and navigate to backend:**
   ```bash
   cd backend

Create a virtual environment:
code Bash

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

Install dependencies:
code Bash

pip install -r requirements.txt

Configure Environment Variables (.env):
code Env

DATABASE_URL=your_postgresql_url
GEMINI_API_KEY=your_key
JWT_SECRET_KEY=your_secret
ALGORITHM=HS256

Run the server:
code Bash

    uvicorn main:app --reload

🧪 Testing

The project uses Pytest for unit and integration testing. We maintain a 100% pass rate across 14+ critical test cases.

Run all tests:
code Bash

pytest test_api.py -v

Key Test Scenarios:

    T01: Successful Login with valid credentials.

    T03: Chatbot Account Opening initiation.

    T06: Application Approval flow (Clerk role).

    T08: Edge case - Fetching non-existent accounts.

📖 API Documentation

Once the server is running, access the interactive documentation at:

    Swagger UI: http://127.0.0.1:8000/docs

    ReDoc: http://127.0.0.1:8000/redoc

🧠 AI Features

    Fraud Model: Random Forest classifier loaded via joblib.

    Chatbot: Context-aware session handling using CHAT_SESSIONS state management.

    OCR: Multipart file handling for ID uploads with automated date-format normalization.
