# Vault42: Gen AI Banking System 🏦 🤖

Vault42 is an AI-driven banking platform developed as a Software Engineering Project (IIT Madras, SEP-2025). The system leverages Generative AI and Machine Learning to streamline customer onboarding, enhance fraud detection, and provide proactive customer support.

## 🚀 Key Features

### 1. Smart Onboarding & KYC
*   **AI-Powered OCR:** Automated data extraction from government IDs (Aadhar, PAN) with 95% accuracy.
*   **Liveness Check:** Biometric face verification using DeepFace to prevent identity fraud.
*   **Real-time Tracking:** Visual timeline for customers to track their KYC status.

### 2. Intelligent Fraud Detection
*   **ML Monitoring:** Real-time transaction analysis using Random Forest algorithms to identify anomalies.
*   **Analyst Dashboard:** Displays the top 20 highest-risk alerts with AI-generated risk factors (e.g., "Unusual Location," "High Amount").
*   **Quick Resolution:** One-click actions for analysts to block accounts, dismiss alerts, or contact customers.

### 3. Proactive Customer Support
*   **GenAI Chatbot:** Powered by Google Gemini 2.5 Flash for guided account opening and balance inquiries.
*   **Alert Banners:** Non-technical status banners for CSRs to explain account blocks empathetically.
*   **Operational Insights:** AI-generated summaries of customer grievances.

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React / Next.js, Tailwind CSS |
| **Backend** | FastAPI, Python 3.12, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL (Supabase), Supabase Storage (S3) |
| **AI/ML** | Google Gemini 2.5 Flash, Scikit-Learn, DeepFace, Pandas, NumPy |
| **DevOps** | Digital Ocean, GitHub Actions |
| **Testing** | Pytest, Swagger UI |

## 📂 Project Structure
```text
├── frontend/             # React/Next.js application
├── backend/              # FastAPI application & ML Models
├── docs/                 # Milestone reports and design diagrams
└── README.md             # Main project documentation


Contributors :
MD Sadiq Hasan Ansari 
Rajeevan Reddy
Abhishek Verma
Shakti Soni
