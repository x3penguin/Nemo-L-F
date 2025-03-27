import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase
cred = credentials.Certificate(os.getenv("SERVICE_KEY"))  # Update with your key path
firebase_admin.initialize_app(cred)

db = firestore.client()

# Save shipping rate data to Firestore
def save_shipping_rate(rate_data):
    doc_ref = db.collection('shipping_rates').document()
    doc_ref.set({
        'timestamp': firestore.SERVER_TIMESTAMP,
        'rate_data': rate_data
    })
    return doc_ref.id