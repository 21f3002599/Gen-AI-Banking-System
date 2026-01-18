from deepface import DeepFace
import os
import tempfile

def verify_faces(img1_path: str, img2_path: str) -> bool:
    try:
        # DeepFace.verify returns a dictionary with 'verified' key
        print("Calling DeepFace.verify...")
        # Using Facenet512 with Cosine metric for better accuracy
        result = DeepFace.verify(
            img1_path, 
            img2_path, 
            model_name="Facenet512", 
            distance_metric="cosine",
            enforce_detection=False
        )
        print(f"DeepFace result: {result}")
        return result["verified"]
    except Exception as e:
        print(f"Error in Face Verification: {e}")
        return False

def extract_face_from_image(img_path: str, output_path: str) -> bool:
    try:
        print(f"Extracting face from {img_path}...")
        # extract_faces returns a list of dicts
        face_objs = DeepFace.extract_faces(img_path = img_path, detector_backend = 'opencv', enforce_detection = False)
        
        if not face_objs:
            print("No face detected.")
            return False
            
        # Take the first face
        face_img = face_objs[0]["face"]
        
        # face_img is a numpy array (float32, 0-1 or 0-255). DeepFace returns 0-1 usually.
        # We need to save it.
        import cv2
        import numpy as np
        
        # Convert to 0-255 uint8
        if face_img.max() <= 1.0:
            face_img = (face_img * 255).astype(np.uint8)
        else:
            face_img = face_img.astype(np.uint8)
            
        # Convert RGB to BGR for OpenCV
        face_img = cv2.cvtColor(face_img, cv2.COLOR_RGB2BGR)
        
        cv2.imwrite(output_path, face_img)
        print(f"Face extracted to {output_path}")
        return True
    except Exception as e:
        print(f"Error in Face Extraction: {e}")
        return False
