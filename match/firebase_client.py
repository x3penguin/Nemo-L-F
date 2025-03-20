
import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase
cred = credentials.Certificate(os.getenv('SERVICE_KEY'))  # Update with your key path
app = firebase_admin.initialize_app(cred, {
    'storageBucket': os.getenv('STORAGE_BUCKET')  # Update with your bucket
})

db = firestore.client()
bucket = storage.bucket()

def get_item_by_id(item_id):
    """Get item by ID from Firestore"""
    doc_ref = db.collection('items').document(item_id)
    doc = doc_ref.get()
    
    if doc.exists:
        item_data = doc.to_dict()
        item_data['id'] = doc.id
        return item_data
    
    return None

def get_lost_items():
    """Get all LOST items from Firestore"""
    query = db.collection('items').where('status', '==', 'LOST')
    docs = query.stream()
    
    items = []
    for doc in docs:
        item_data = doc.to_dict()
        item_data['id'] = doc.id
        items.append(item_data)
    
    return items

def update_matched_items(found_item_id, lost_item_id, confidence):
    """Update both items as matched"""
    # Get a new transaction
    transaction = db.transaction()
    
    @firestore.transactional
    def update_in_transaction(transaction, found_id, lost_id, conf):
        # Update found item
        found_ref = db.collection('items').document(found_id)
        transaction.update(found_ref, {
            'status': 'MATCHED',
            'matchedItemId': lost_id,
            'matchingConfidence': conf,
            'matchedDate': firestore.SERVER_TIMESTAMP
        })
        
        # Update lost item
        lost_ref = db.collection('items').document(lost_id)
        transaction.update(lost_ref, {
            'status': 'MATCHED',
            'matchedItemId': found_id,
            'matchingConfidence': conf,
            'matchedDate': firestore.SERVER_TIMESTAMP
        })
    
    # Execute the transaction
    update_in_transaction(transaction, found_item_id, lost_item_id, confidence)
    
    print(f"Updated items {found_item_id} and {lost_item_id} as matched")