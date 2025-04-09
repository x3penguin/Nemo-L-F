import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
from google.cloud.firestore_v1.base_query import FieldFilter
from dotenv import load_dotenv
import datetime
from kafka import KafkaProducer
import json

load_dotenv()

# Initialize Firebase
cred = credentials.Certificate(os.getenv("SERVICE_KEY"))  # Update with your key path
app = firebase_admin.initialize_app(
    cred, {"storageBucket": os.getenv("STORAGE_BUCKET")}  # Update with your bucket
)

db = firestore.client()
bucket = storage.bucket()


def get_item_by_id(item_id):
    """Get item by ID from Firestore"""
    doc_ref = db.collection("items").document(item_id)
    doc = doc_ref.get()

    if doc.exists:
        item_data = doc.to_dict()
        item_data["id"] = doc.id
        return item_data

    return None


def store_potential_matches(found_item_id, lost_item_id, confidence, distance=None):
    """Store potential match data for UI display, avoiding duplicates"""
    try:
        # First check if this pair already exists
        potential_matches_ref = db.collection("potential_matches")
        
        # Query for existing matches between these two items
        query = potential_matches_ref.where(
            filter=FieldFilter("foundItemId", "==", found_item_id)
        ).where(
            filter=FieldFilter("lostItemId", "==", lost_item_id)
        )
        
        existing_matches = list(query.stream())
        
        # If match already exists, update it
        if len(existing_matches) > 0:
            # Get the first match (should be only one)
            match_doc = existing_matches[0]
            
            # Only update if the new confidence is higher
            existing_confidence = match_doc.get("confidence") or 0
            if confidence > existing_confidence:
                match_doc.reference.update({
                    "confidence": confidence,
                    "distance": distance,
                    "updatedAt": firestore.SERVER_TIMESTAMP
                })
                print(f"Updated potential match between {found_item_id} and {lost_item_id} with higher confidence")
        else:
            # If no match exists, create a new one
            potential_match_ref = potential_matches_ref.document()
            potential_match_ref.set({
                "foundItemId": found_item_id,
                "lostItemId": lost_item_id,
                "confidence": confidence,
                "distance": distance,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "viewed": False,
            })
            print(f"Stored new potential match between {found_item_id} and {lost_item_id}")
            
            # Get the lost item to determine owner
            lost_item = get_item_by_id(lost_item_id)
            found_item = get_item_by_id(found_item_id)
            
            if lost_item and found_item:
                # Send notification event to Kafka
                try:
                    kafka_brokers = os.environ.get('KAFKA_BROKERS')
                    producer = KafkaProducer(
                        bootstrap_servers=kafka_brokers,
                        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                        key_serializer=lambda k: str(k).encode('utf-8')
                    )
                    
                    # Publish notification event
                    producer.send(
                        'potential-match-notifications', 
                        key=lost_item_id,
                        value={
                            'lostItemId': lost_item_id,
                            'foundItemId': found_item_id,
                            'lostItemName': lost_item.get('name', 'Lost Item'),
                            'foundItemName': found_item.get('name', 'Found Item'),
                            'ownerId': lost_item.get('ownerId'),
                            'confidence': confidence,
                            'timestamp': datetime.datetime.now().isoformat()
                        }
                    )
                    producer.flush()
                    print(f"Published potential match notification to Kafka")
                except Exception as e:
                    print(f"Error publishing to Kafka: {e}")
        
        return True
    except Exception as e:
        print(f"Error storing potential match: {e}")
        return False


def get_lost_items():
    """Get all LOST items from Firestore"""
    query = db.collection("items").where(filter=FieldFilter("status", "==", "LOST"))
    docs = query.stream()
    items = []
    for doc in docs:
        item_data = doc.to_dict()
        item_data["id"] = doc.id
        items.append(item_data)
    return items


def get_owner_details(item_id):
    """Get owner details from Firestore using item ID"""
    try:
        item = get_item_by_id(item_id)
        if not item or not item.get("ownerId"):
            return None

        owner_id = item["ownerId"]
        user_ref = db.collection("users").document(str(owner_id))
        user_doc = user_ref.get()

        if user_doc.exists:
            return user_doc.to_dict()
        return None
    except Exception as e:
        print(f"Error getting owner details: {e}")
        return None
