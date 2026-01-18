import google.generativeai as genai
from PIL import Image
import io
import json
import os
from typing import Optional, Dict, Any

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not set in environment variables")

def extract_adhar_front(image_bytes: bytes) -> Dict[str, Optional[str]]:
    """
    Extract identity data from Adhar card front using Gemini Vision.
    
    Returns:
        dict with keys: name, dob, gender, adhar_no
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
You are an OCR system specialized in reading Indian Aadhaar cards (Front Side).
Extract the following information from this Aadhaar card image and return ONLY a JSON object:

{
  "is_adhar_card": true/false,
  "name": "Full name in English",
  "dob": "Date of birth in DD/MM/YYYY format",
  "gender": "Male or Female",
  "adhar_no": "12-digit Aadhaar number without spaces"
}

Rules:
- First, determine if the image is a valid Indian Aadhaar card front. Set "is_adhar_card" to true if it is, false otherwise.
- If "is_adhar_card" is false, set all other fields to null.
- For the name, extract the English/Latin script name, not Hindi/Devanagari
- For DOB, use DD/MM/YYYY format (example: 15/08/1990)
- For Aadhaar number, remove all spaces
- Return ONLY valid JSON, no other text
"""
        
        response = model.generate_content([prompt, image])
        json_text = response.text.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(json_text)
        print(f"Gemini extracted Adhar Front data: {data}")
        return data
        
    except Exception as e:
        print(f"Error in Gemini Adhar Front extraction: {e}")
        return {"error": "network_error"}

def extract_adhar_back(image_bytes: bytes) -> Dict[str, Optional[str]]:
    """
    Extract address data from Adhar card back using Gemini Vision.
    
    Returns:
        dict with keys: address, city, district, state, pincode
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
You are an OCR system specialized in reading Indian Aadhaar cards (Back Side).
Extract the address information from this Aadhaar card image and return ONLY a JSON object:

{
  "is_adhar_back": true/false,
  "address": "Full address string",
  "city": "City/Town/Village",
  "district": "District",
  "state": "State",
  "pincode": "Pincode"
}

Rules:
- First, determine if the image is a valid Indian Aadhaar card back (usually contains address). Set "is_adhar_back" to true if it is.
- If not valid, set all fields to null.
- Extract the full address as one string in "address".
- Also try to parse out city, district, state, and pincode separately if clearly identifiable.
- Return ONLY valid JSON, no other text
"""
        
        response = model.generate_content([prompt, image])
        json_text = response.text.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(json_text)
        print(f"Gemini extracted Adhar Back data: {data}")
        return data
        
    except Exception as e:
        print(f"Error in Gemini Adhar Back extraction: {e}")
        return {"error": "network_error"}

def extract_pan_data(image_bytes: bytes) -> Dict[str, Optional[str]]:
    """
    Extract data from PAN card using Gemini Vision.
    
    Returns:
        dict with keys: name, dob, father_name, pan_no
    """
    try:
        # Load image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Use Gemini 2.5 Flash
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = """
You are an OCR system specialized in reading Indian PAN cards.
Extract the following information from this PAN card image and return ONLY a JSON object:

{
  "is_pan_card": true/false,
  "name": "Cardholder's full name",
  "dob": "Date of birth in DD/MM/YYYY format if visible, otherwise null",
  "father_name": "Father's name if visible, otherwise null",
  "pan_no": "10-character PAN number (format: AAAAA9999A)"
}

Rules:
- First, determine if the image is a valid Indian PAN card. Set "is_pan_card" to true if it is, false otherwise.
- If "is_pan_card" is false, set all other fields to null.
- If a field is not clearly visible, set it to null
- For DOB, use DD/MM/YYYY format (example: 15/08/1990)
- PAN number is always 10 characters: 5 letters, 4 digits, 1 letter
- Return ONLY valid JSON, no other text
"""
        
        response = model.generate_content([prompt, image])
        
        # Parse JSON response
        json_text = response.text.strip()
        # Remove markdown code blocks if present
        if json_text.startswith("```json"):
            json_text = json_text[7:]
        if json_text.startswith("```"):
            json_text = json_text[3:]
        if json_text.endswith("```"):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        data = json.loads(json_text)
        print(f"Gemini extracted PAN data: {data}")
        return data
        
    except Exception as e:
        print(f"Error in Gemini PAN extraction: {e}")
        return {"error": "network_error"}

def interpret_correction(current_data: Dict[str, Any], user_message: str) -> Dict[str, Any]:
    """
    Uses Gemini to interpret a user's correction message and update the current data dictionary.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        You are a helpful assistant correcting OCR data based on user feedback.
        
        Current Data:
        {json.dumps(current_data, indent=2)}
        
        User Message: "{user_message}"
        
        Instructions:
        1. Identify which fields in the Current Data the user wants to change.
        2. Update those fields with the new values provided by the user.
        3. Return the COMPLETE updated JSON object.
        4. Do NOT change fields that the user did not mention.
        5. Return ONLY the JSON object, no markdown formatting.
        """
        
        response = model.generate_content(prompt)
        json_text = response.text.strip()
        if json_text.startswith("```json"):
            json_text = json_text[7:]
        if json_text.startswith("```"):
            json_text = json_text[3:]
        if json_text.endswith("```"):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        updated_data = json.loads(json_text)
        return updated_data
    except Exception as e:
        print(f"Error interpreting correction: {e}")
        return {"error": "network_error"}
