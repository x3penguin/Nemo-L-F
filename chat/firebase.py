import os
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from dotenv import load_dotenv

load_dotenv()

# Load Firebase only once
print(os.getenv("STORAGE_BUCKET"))
if not firebase_admin._apps:
    cred = credentials.Certificate(os.getenv("SERVICE_KEY"))
    firebase_admin.initialize_app(cred, {
        "storageBucket": os.getenv("STORAGE_BUCKET")
    })

# Export shared Firebase clients
db = firestore.client()
bucket = storage.bucket()
