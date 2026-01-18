import google.generativeai as genai
import os
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid
import json

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def process_user_query(user_id: uuid.UUID, message: str, db: Session) -> str:
    """
    Translates a natural language query into SQL, executes it, and returns a natural language response.
    Restricted to the specific user_id.
    """
    
    # 1. Construct the schema context
    schema_context = """
    Tables and Columns:
    
    1. application_table
       - application_no (UUID)
       - user_id (UUID)
       - firstname, lastname, father_name (String)
       - application_status (String: 'pending', 'approved', 'rejected')
       - email, mobile_no (String)
       - kyc_status (Boolean)
       - adhar_card_no, pan_card_no (String)
       - address_line, city, district, state, pincode (String)
       
    2. customer
       - customer_id (UUID)
       - user_id (UUID)
       - firstname, lastname (String)
       - city, state, country (String)
       - email, mobile_no (String)
       
    3. account
       - account_id (UUID)
       - customer_id (UUID)
       - account_no (String)
       - current_balance (Float)
       - status_flag (String: 'active', 'blocked', etc.)
       - account_type (String)
       
    4. transactions
       - transaction_id (UUID)
       - account_no (String)
       - amount (Float)
       - mode_of_transaction (String)
       - date (Date), time (DateTime)
       - reason_of_transaction (String)
    """
    
    # 2. Prompt for SQL Generation
    sql_prompt = f"""
    You are a SQL expert. Convert the following natural language query into a PostgreSQL SQL query.
    
    Context:
    {schema_context}
    
    User Query: "{message}"
    Current User ID: '{user_id}'
    
    Rules:
    1. You MUST filter by user_id = '{user_id}' for application_table and customer tables.
    2. Use LEFT JOIN when joining tables to ensure data is not lost if a record is missing in the joined table (e.g., an applicant might not be a customer yet).
    3. Return ONLY the SQL query. No markdown, no explanation.
    4. The query must be READ-ONLY (SELECT only).
    5. If the query is unrelated to the database or cannot be answered, return "NO_QUERY".
    """
    
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    try:
        response = model.generate_content(sql_prompt)
        sql_query = response.text.strip().replace("```sql", "").replace("```", "").strip()
        
        if sql_query == "NO_QUERY":
            return "I apologize, but I am a banking assistant and can only help with your account, application, or transactions. Is there anything banking-related I can assist you with?"
            
        print(f"Generated SQL: {sql_query}")
        
        # 3. Execute SQL
        # Safety check: ensure it's a SELECT or WITH
        if not (sql_query.lower().startswith("select") or sql_query.lower().startswith("with")):
             return "I cannot execute this type of query."

        result = db.execute(text(sql_query))
        rows = result.fetchall()
        columns = result.keys()
        
        data = [dict(zip(columns, row)) for row in rows]
        
        # 4. Generate Natural Language Response
        nl_prompt = f"""
        User Query: "{message}"
        SQL Query Executed: "{sql_query}"
        Data Retrieved: {json.dumps(data, default=str)}
        
        Generate a helpful, natural language response for the user based on this data.
        If no data was found, explain that politely.
        """
        
        nl_response = model.generate_content(nl_prompt)
        return nl_response.text.strip()
        
    except Exception as e:
        print(f"Query Engine Error: {e}")
        return "I encountered an error while processing your request."
