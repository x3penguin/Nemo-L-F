import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase
cred = credentials.Certificate(os.getenv("SERVICE_KEY"))  # Update with your key path
firebase_admin.initialize_app(cred)

db = firestore.client()

def save_selected_order(order_data):
    doc_ref = db.collection('selected_orders').document()
    doc_ref.set({
        'timestamp': firestore.SERVER_TIMESTAMP,
        'order_data': order_data,
        'status': 'selected'
    })
    return doc_ref.id
