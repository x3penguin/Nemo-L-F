import os
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import jwt

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "default_secret")
ALGORITHM = "HS256"

# Load Firebase only once
print(os.getenv("STORAGE_BUCKET"))
if not firebase_admin._apps:
    cred = credentials.Certificate(os.getenv("SERVICE_KEY"))
    firebase_admin.initialize_app(cred, {
        "storageBucket": os.getenv("STORAGE_BUCKET")
    })

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload  # You can access user ID from payload['userId']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(payload: dict = Depends(verify_token)):
    user_id = payload.get("userId")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")
    return user_id

# Export shared Firebase clients
db = firestore.client()
bucket = storage.bucket()
