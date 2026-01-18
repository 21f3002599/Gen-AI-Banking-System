from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Dict, Any
import uuid
from datetime import datetime
import io
import tempfile
import os

from database import get_db
from models import User, Customer, Account, ApplicationTable
from utils.verification import verify_faces
from utils.storage import upload_file_to_s3
from pydantic import BaseModel

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# In-memory session store
# Format: { user_id: { "state": "...", "data": { ... } } }
CHAT_SESSIONS: Dict[uuid.UUID, Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    message: str
    user_id: uuid.UUID

from typing import List, Optional

class MessagePayload(BaseModel):
    extractedData: Dict[str, Any] | None = None
    action: str | None = None # For frontend triggers (e.g., open camera)

class ChatMessage(BaseModel):
    id: uuid.UUID
    type: str # 'text', 'extraction-success', 'error', 'action-required'
    text: str
    timestamp: datetime
    payload: MessagePayload | None = None

class ChatResponse(BaseModel):
    messages: List[ChatMessage]

def create_response(text: str, type: str = "text", payload_data: Dict[str, Any] | None = None, action: str | None = None) -> ChatResponse:
    payload = MessagePayload(extractedData=payload_data, action=action) if (payload_data or action) else None
    return ChatResponse(
        messages=[
            ChatMessage(
                id=uuid.uuid4(),
                type=type,
                text=text,
                timestamp=datetime.now(),
                payload=payload
            )
        ]
    )

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    user_id = request.user_id
    message = request.message.lower().strip()
    
    # Initialize session if not exists
    if user_id not in CHAT_SESSIONS:
        CHAT_SESSIONS[user_id] = {"state": "INITIAL", "data": {}}
    
    session = CHAT_SESSIONS[user_id]
    state = session["state"]
    print(f"DEBUG: User: {user_id}, State: {state}, Message: '{message}'")
    
    # Global commands
    if any(word in message for word in ["stop", "cancel", "later", "abort", "exit", "quit", "afterwards", "after words"]):
        session["state"] = "INITIAL"
        session["data"] = {}
        return create_response(
            text="I've stopped the current process. Is there anything else I can help you with? You can ask about your balance, application status, or say 'open account' to start over."
        )

    if "open" in message and "account" in message:
        session["state"] = "AWAITING_ADHAR_FRONT"
        session["data"] = {}
        return create_response(
            text="Sure, I can help you open an account. Please upload a clear photo of the FRONT side of your Adhar Card.",
            type="action-required",
            action="upload_adhar"
        )
    
    if "balance" in message:
        # Check balance logic
        customer = db.query(Customer).filter(Customer.user_id == user_id).first()
        if not customer:
            return create_response(text="You don't have a customer account linked yet.")
        
        account = db.query(Account).filter(Account.customer_id == customer.customer_id).first()
        if not account:
            return create_response(text="No active accounts found.")
        
        return create_response(text=f"Your current balance is {account.current_balance}")

    # State Machine
    # State Machine
    if state == "INITIAL":
        # If it's a greeting, return welcome message
        # Use set intersection for whole word matching
        message_words = set(message.lower().split())
        greetings = {"hi", "hello", "hey", "start", "ok", "okay", "thanks", "thank"}
        if message_words & greetings:
             return create_response(text="Hello! I am your banking assistant. I can help you open an account, check your balance, or answer questions about your application status.")
        
        # Otherwise, let it fall through to the General Query Engine
        pass

    elif state == "AWAITING_ADHAR_FRONT":
        return create_response(text="Please upload the FRONT side of your Adhar Card to proceed.", type="action-required", action="upload_adhar")

    elif state == "CONFIRMING_ADHAR_FRONT":
        if message == "correct":
            session["state"] = "AWAITING_ADHAR_BACK"
            return create_response(text="Great! Identity details verified. Now, please upload the BACK side of your Adhar Card (with address).", type="action-required", action="upload_adhar")
        else:
            # Interpret correction
            from utils.ocr import interpret_correction
            
            current_data = {
                "name": f"{session['data'].get('firstname', '')} {session['data'].get('lastname', '')}".strip(),
                "dob": session["data"].get("dob"),
                "gender": session["data"].get("gender"),
                "adhar_no": session["data"].get("adhar_no")
            }
            
            updated_data = interpret_correction(current_data, message)
            
            if updated_data.get("error") == "network_error":
                return create_response(text="There was some network error. We will back soon. Till then is there anything else i can help you with?")
            
            if "name" in updated_data:
                name_parts = updated_data["name"].split()
                session["data"]["firstname"] = name_parts[0]
                session["data"]["lastname"] = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
            if "dob" in updated_data: session["data"]["dob"] = updated_data["dob"]
            if "gender" in updated_data: session["data"]["gender"] = updated_data["gender"]
            if "adhar_no" in updated_data: session["data"]["adhar_no"] = updated_data["adhar_no"]
            
            name = f"{session['data'].get('firstname', '')} {session['data'].get('lastname', '')}".strip()
            return create_response(
                text=f"Updated details:\n\nName: {name}\nDOB: {session['data']['dob']}\nGender: {session['data']['gender']}\nAdhar No: {session['data']['adhar_no']}\n\nIs this correct now?"
            )

    elif state == "AWAITING_ADHAR_BACK":
        return create_response(text="Please upload the BACK side of your Adhar Card to proceed.", type="action-required", action="upload_adhar")

    elif state == "CONFIRMING_ADHAR_BACK":
        if message == "correct":
            session["state"] = "AWAITING_PAN"
            return create_response(text="Address details verified. Now, please upload your PAN Card.", type="action-required", action="upload_pan")
        else:
            # Interpret correction
            from utils.ocr import interpret_correction
            
            current_data = {
                "address": session["data"].get("address"),
                "city": session["data"].get("city"),
                "district": session["data"].get("district"),
                "state": session["data"].get("state"),
                "pincode": session["data"].get("pincode")
            }
            
            updated_data = interpret_correction(current_data, message)
            
            if updated_data.get("error") == "network_error":
                return create_response(text="There was some network error. We will back soon. Till then is there anything else i can help you with?")
            
            if "address" in updated_data: session["data"]["address"] = updated_data["address"]
            if "city" in updated_data: session["data"]["city"] = updated_data["city"]
            if "district" in updated_data: session["data"]["district"] = updated_data["district"]
            if "state" in updated_data: session["data"]["state"] = updated_data["state"]
            if "pincode" in updated_data: session["data"]["pincode"] = updated_data["pincode"]
            
            return create_response(
                text=f"Updated address:\n\nAddress: {session['data']['address']}\nCity: {session['data']['city']}\nDistrict: {session['data']['district']}\nState: {session['data']['state']}\nPincode: {session['data']['pincode']}\n\nIs this correct now?"
            )

    elif state == "AWAITING_PAN":
        return create_response(text="Please upload your PAN Card photo to proceed.", type="action-required", action="upload_pan")

    elif state == "CONFIRMING_PAN":
        if message == "correct":
            # Perform Cross-Validation here
            pan_name = session["data"].get("pan_name")
            pan_dob = session["data"].get("pan_dob")
            
            adhar_name = f"{session['data']['firstname']} {session['data']['lastname']}".strip()
            adhar_dob = session['data']['dob']
            
            match_status = "✅ Adhar and PAN details matched."
            
            if pan_dob and pan_dob != adhar_dob:
                match_status = f"⚠️ DOB mismatch! Adhar: {adhar_dob}, PAN: {pan_dob}"
            elif pan_name and adhar_name.lower() not in pan_name.lower() and pan_name.lower() not in adhar_name.lower():
                 match_status = f"⚠️ Name mismatch! Adhar: {adhar_name}, PAN: {pan_name}"
            
            session["state"] = "AWAITING_LIVE_PHOTO"
            return create_response(
                text=f"Details confirmed.\n\n{match_status}\n\nPlease upload a live photo of yourself to complete verification.",
                type="action-required",
                action="upload_live_photo"
            )
        else:
            # Interpret correction
            from utils.ocr import interpret_correction
            
            current_data = {
                "pan_no": session["data"].get("pan_no"),
                "name": session["data"].get("pan_name"),
                "father_name": session["data"].get("father_name"),
                "dob": session["data"].get("pan_dob")
            }
            
            updated_data = interpret_correction(current_data, message)
            
            if updated_data.get("error") == "network_error":
                return create_response(text="There was some network error. We will back soon. Till then is there anything else i can help you with?")
            
            if "pan_no" in updated_data: session["data"]["pan_no"] = updated_data["pan_no"]
            if "name" in updated_data: session["data"]["pan_name"] = updated_data["name"]
            if "father_name" in updated_data: session["data"]["father_name"] = updated_data["father_name"]
            if "dob" in updated_data: session["data"]["pan_dob"] = updated_data["dob"]
            
            return create_response(
                text=f"Updated PAN details:\n\nNumber: {session['data']['pan_no']}\nName: {session['data']['pan_name']}\nFather's Name: {session['data']['father_name']}\nDOB: {session['data']['pan_dob']}\n\nIs this correct now?"
            )

    elif state == "AWAITING_LIVE_PHOTO":
        return create_response(text="Please upload a live photo of yourself to complete verification.", type="action-required", action="upload_live_photo")

    # Fallback: Try General Query Engine
    try:
        from utils.query_engine import process_user_query
        response_text = process_user_query(user_id, message, db)
        return create_response(text=response_text)
    except Exception as e:
        print(f"Fallback Query Error: {e}")
        return create_response(text="I didn't understand that. How can I help?")


@router.post("/upload", response_model=ChatResponse)
async def upload_file(
    user_id: uuid.UUID = Form(...),
    file: UploadFile = File(...),
    file_type: str = Form(...), # adhar, pan, live_photo
    db: Session = Depends(get_db)
):
    if user_id not in CHAT_SESSIONS:
        raise HTTPException(status_code=400, detail="No active session")
    
    session = CHAT_SESSIONS[user_id]
    state = session["state"]
    
    # Read file content
    content = await file.read()
    
    if file_type == "adhar":
        if state == "AWAITING_ADHAR_FRONT":
            # Use Gemini to extract Adhar Front data
            from utils.ocr import extract_adhar_front
            details = extract_adhar_front(content)
            print(f"Gemini extracted Adhar Front details: {details}")
            
            if details.get("error") == "network_error":
                 return create_response(text="There was some network error. We will back soon. Till then is there anything else i can help you with?")
            
            if details.get("is_adhar_card") is False:
                 return create_response(text="This does not appear to be a valid Adhar Card Front. Please upload a clear photo.")
            
            if not details.get("name") or not details.get("dob") or not details.get("adhar_no"):
                return create_response(text="Could not extract critical details (Name, DOB, Adhar No). Please upload a clearer image.")
            
            # Check for duplicate application
            existing_app = db.query(ApplicationTable).filter(ApplicationTable.adhar_card_no == details["adhar_no"]).first()
            if existing_app:
                session["state"] = "INITIAL"
                session["data"] = {}
                return create_response(
                    text=f"⚠️ Application Already Exists!\n\nApplication No: {existing_app.application_no}\nStatus: {existing_app.application_status}\n\nYou cannot submit a duplicate application."
                )
            
            # Upload to S3
            try:
                public_url = upload_file_to_s3(io.BytesIO(content), "kyc-documents", f"{user_id}_adhar_front.jpg", file.content_type)
                session["data"]["adhar_image_url"] = public_url
            except Exception as e:
                print(f"S3 upload failed for Adhar Front: {e}")
                return create_response(text=f"Failed to store Adhar card image. Please try again. Error: {str(e)}")
            
            # Store in session
            session["data"]["adhar_image"] = content
            
            # Store extracted fields
            name = details["name"]
            session["data"]["firstname"] = name.split()[0]
            session["data"]["lastname"] = " ".join(name.split()[1:]) if len(name.split()) > 1 else ""
            session["data"]["dob"] = details["dob"]
            session["data"]["adhar_no"] = details["adhar_no"]
            session["data"]["gender"] = details.get("gender") or "Other"
            
            session["state"] = "CONFIRMING_ADHAR_FRONT"
            
            # Construct payload for frontend
            payload_data = {
                "Name": name,
                "DOB": details['dob'],
                "Gender": session['data']['gender'],
                "ID Number": details['adhar_no']
            }
            
            return create_response(
                text=f"Adhar Front scanned. Please review:\n\nName: {name}\nDOB: {details['dob']}\nGender: {session['data']['gender']}\nAdhar No: {details['adhar_no']}\n\nIs this correct? Type 'correct' to proceed.",
                type="extraction-success",
                payload_data=payload_data
            )

        elif state == "AWAITING_ADHAR_BACK":
            # Use Gemini to extract Adhar Back data
            from utils.ocr import extract_adhar_back
            details = extract_adhar_back(content)
            print(f"Gemini extracted Adhar Back details: {details}")
            
            if details.get("error") == "network_error":
                 return create_response(text="There was some network error. We will back soon. Till then is there anything else i can help you with?")
            
            if details.get("is_adhar_back") is False:
                 return create_response(text="This does not appear to be a valid Adhar Card Back (Address side). Please upload a clear photo.")
            
            # Upload to S3
            try:
                public_url = upload_file_to_s3(io.BytesIO(content), "kyc-documents", f"{user_id}_adhar_back.jpg", file.content_type)
                session["data"]["adhar_back_image_url"] = public_url
            except Exception as e:
                print(f"S3 upload failed for Adhar Back: {e}")
                return create_response(text=f"Failed to store Adhar card image. Please try again. Error: {str(e)}")
            
            # Store extracted address fields
            session["data"]["address"] = details.get("address") or "Unknown Address"
            session["data"]["city"] = details.get("city") or "Unknown City"
            session["data"]["district"] = details.get("district") or "Unknown District"
            session["data"]["state"] = details.get("state") or "Unknown State"
            session["data"]["pincode"] = details.get("pincode") or "000000"
            
            session["state"] = "CONFIRMING_ADHAR_BACK"
            
            payload_data = {
                "Address": session["data"]["address"],
                "City": session["data"]["city"],
                "District": session["data"]["district"],
                "State": session["data"]["state"],
                "Pincode": session["data"]["pincode"]
            }
            
            return create_response(
                text=f"Adhar Back scanned. Address details:\n\nAddress: {session['data']['address']}\nCity: {session['data']['city']}\nDistrict: {session['data']['district']}\nState: {session['data']['state']}\nPincode: {session['data']['pincode']}\n\nIs this correct? Type 'correct' to proceed.",
                type="extraction-success",
                payload_data=payload_data
            )
        
        else:
            return create_response(text="Not expecting Adhar card now.")

    elif file_type == "pan":
        if state != "AWAITING_PAN":
             return create_response(text="Not expecting PAN card now.")
         
        # Use Gemini to extract PAN data
        from utils.ocr import extract_pan_data
        details = extract_pan_data(content)
        print(f"Gemini extracted PAN details: {details}")
        
        if details.get("error") == "network_error":
             return create_response(text="There was some network error. We will back soon. Till then is there anything else i can help you with?")
        
        # Check if it's a valid PAN card
        if details.get("is_pan_card") is False:
             return create_response(text="This does not appear to be a valid PAN Card. Please upload a clear photo of your PAN Card.")
        
        # Strict validation - require PAN number and father's name
        if not details.get("pan_no"):
            return create_response(text="Could not extract PAN Number from PAN Card. Please upload a clearer image.")
        if not details.get("father_name"):
            return create_response(text="Could not extract Father's Name from PAN Card. Please upload a clearer image.")
        
        # Upload to S3
        try:
            public_url = upload_file_to_s3(io.BytesIO(content), "kyc-documents", f"{user_id}_pan.jpg", file.content_type)
            session["data"]["pan_image_url"] = public_url
        except Exception as e:
            print(f"S3 upload failed for PAN: {e}")
            return create_response(text=f"Failed to store PAN card image. Please try again. Error: {str(e)}")
        
        # Store extracted data (all guaranteed to exist now)
        session["data"]["pan_no"] = details["pan_no"]
        session["data"]["father_name"] = details["father_name"]
        session["data"]["pan_name"] = details.get("name")
        session["data"]["pan_dob"] = details.get("dob")
        
        # Cross-validate name and DOB
        pan_name = details.get("name")
        pan_dob = details.get("dob")
        
        adhar_name = f"{session['data']['firstname']} {session['data']['lastname']}".strip()
        adhar_dob = session['data']['dob']
        
        # Compare details
        match_status = "✅ Adhar and PAN details matched."
        
        # DOB Check
        if pan_dob and pan_dob != adhar_dob:
            match_status = f"⚠️ DOB mismatch! Adhar: {adhar_dob}, PAN: {pan_dob}"
            
        # Name Check (Simple case-insensitive check)
        elif pan_name and adhar_name.lower() not in pan_name.lower() and pan_name.lower() not in adhar_name.lower():
             match_status = f"⚠️ Name mismatch! Adhar: {adhar_name}, PAN: {pan_name}"

        session["state"] = "CONFIRMING_PAN"
        
        response_msg = (
            f"PAN extracted. Please review:\n\n"
            f"Number: {details['pan_no']}\n"
            f"Name: {pan_name}\n"
            f"Father's Name: {details['father_name']}\n"
            f"DOB: {pan_dob}\n\n"
            "Is this correct? Type 'correct' to proceed, or tell me what to change."
        )
        
        payload_data = {
            "Number": details['pan_no'],
            "Name": pan_name,
            "Father's Name": details['father_name'],
            "DOB": pan_dob
        }
        
        return create_response(
            text=response_msg,
            type="extraction-success",
            payload_data=payload_data
        )

    elif file_type == "live_photo":
        if state != "AWAITING_LIVE_PHOTO":
             return create_response(text="Not expecting live photo now.")
        
        # Save live photo temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_live:
            tmp_live.write(content)
            live_photo_path = tmp_live.name
            
        # Save adhar photo temporarily (from memory or download)
        if "adhar_image" not in session["data"]:
             return create_response(text="Adhar image missing from session.")
             
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_adhar:
            tmp_adhar.write(session["data"]["adhar_image"])
            adhar_photo_path = tmp_adhar.name
            
        # Extract face from Adhar
        from utils.verification import extract_face_from_image
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_adhar_face:
            adhar_face_path = tmp_adhar_face.name
            
        print(f"Extracting face from {adhar_photo_path} to {adhar_face_path}...")
        has_face = extract_face_from_image(adhar_photo_path, adhar_face_path)
        
        target_verification_path = adhar_face_path
        if has_face:
            print("Using extracted face for verification.")
        else:
            print("Face extraction failed.")
            # Cleanup temp files
            if os.path.exists(live_photo_path): os.unlink(live_photo_path)
            if os.path.exists(adhar_photo_path): os.unlink(adhar_photo_path)
            if os.path.exists(adhar_face_path): os.unlink(adhar_face_path)
            
            return create_response(text="Could not detect a clear face in your Adhar Card. Verification requires a clear face photo. Please restart and upload a clearer Adhar Card.")

        # Verify Faces
        is_match = verify_faces(live_photo_path, target_verification_path)
        print(f"Face verification result: {is_match}")

        # Cleanup temp files
        if os.path.exists(live_photo_path): os.unlink(live_photo_path)
        if os.path.exists(adhar_photo_path): os.unlink(adhar_photo_path)
        if os.path.exists(adhar_face_path): os.unlink(adhar_face_path)
        
        # Initialize retry count if not present
        if "retry_count" not in session["data"]:
            session["data"]["retry_count"] = 0

        if is_match:
            kyc_status = True
            message = "Verification successful! Application submitted."
            status_code = "verified"
        else:
            session["data"]["retry_count"] += 1
            retry_count = session["data"]["retry_count"]
            
            if retry_count < 3:
                remaining = 3 - retry_count
                return create_response(
                    text=f"Face verification failed. You have {remaining} attempts remaining. Please upload a clearer photo.",
                    type="action-required",
                    action="upload_live_photo"
                )
            else:
                kyc_status = False
                message = "Face verification failed 3 times. Your application has been submitted, but you must visit the bank branch to complete manual KYC."
                status_code = "manual_kyc"

        # Upload to S3 (Only if verified or max retries reached)
        try:
            public_url = upload_file_to_s3(io.BytesIO(content), "kyc-documents", f"{user_id}_live.jpg", file.content_type)
            session["data"]["customer_image_url"] = public_url
        except Exception as e:
            print(f"S3 upload failed for Live Photo: {e}")
            return create_response(text=f"Failed to store live photo. Please try again. Error: {str(e)}")

        try:
            # Create Application
            # public_url is already in session["data"]["customer_image_url"]
            
            # Convert DOB format if needed
            dob_str = session["data"]["dob"]
            if "/" in dob_str:
                day, month, year = dob_str.split("/")
                dob_obj = datetime(int(year), int(month), int(day)).date()
            else:
                dob_obj = datetime.strptime(dob_str, "%Y-%m-%d").date()
            
            # Fetch user email and mobile from User table
            user = db.query(User).filter(User.user_id == user_id).first()
            user_email = user.email if user else "demo@example.com"
            user_mobile = user.mobile_no if user else "9999999999"
            
            # Draft Application
            new_app = ApplicationTable(
                user_id=user_id,
                firstname=session["data"]["firstname"],
                lastname=session["data"]["lastname"],
                father_name=session["data"]["father_name"],
                address_line=session["data"]["address"],
                city=session["data"].get("city", "Unknown"),
                district=session["data"].get("district", "Unknown"),
                state=session["data"].get("state", "Unknown"),
                pincode=session["data"].get("pincode", "000000"),
                country="India",
                adhar_card_no=session["data"]["adhar_no"],
                pan_card_no=session["data"]["pan_no"],
                email=user_email,
                mobile_no=user_mobile,
                dob=dob_obj,
                gender=session["data"].get("gender"),
                kyc_status=kyc_status,
                adhar_card_image_url=session["data"]["adhar_image_url"],
                pan_card_image_url=session["data"]["pan_image_url"],
                customer_image_url=session["data"]["customer_image_url"],
                application_status="pending"
            )
            db.add(new_app)
            db.commit()
            
            session["state"] = "COMPLETED"
            return create_response(text=message)
        except Exception as e:
            print(f"Error saving application: {e}")
            return create_response(text=f"Process completed but failed to save application: {str(e)}")

    return create_response(text="Invalid file type")
