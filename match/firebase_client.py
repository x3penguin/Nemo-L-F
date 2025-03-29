import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
from google.cloud.firestore_v1.base_query import FieldFilter
from dotenv import load_dotenv

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
    """Store potential match data for UI display"""
    try:
        # Create a potential match document
        potential_match_ref = db.collection("potential_matches").document()

        potential_match_ref.set(
            {
                "foundItemId": found_item_id,
                "lostItemId": lost_item_id,
                "confidence": confidence,
                "distance": distance,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "viewed": False,
            }
        )

        print(f"Stored potential match between {found_item_id} and {lost_item_id}")
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


def update_matched_items(found_item_id, lost_item_id, confidence):
    transaction = db.transaction()

    @firestore.transactional
    def update_in_transaction(transaction, found_id, lost_id, conf):
        # Get the found item
        found_ref = db.collection("items").document(found_id)
        found_item = found_ref.get(transaction=transaction).to_dict()
        finder_id = found_item.get("finderId")
        found_report_owner = found_item.get("reportOwner")  # Get the reportOwner

        # Get the lost item to get the owner ID and reportOwner
        lost_ref = db.collection("items").document(lost_id)
        lost_item = lost_ref.get(transaction=transaction).to_dict()
        owner_id = lost_item.get("ownerId")
        lost_report_owner = lost_item.get("reportOwner")

        # Update found item - keep its reportType
        transaction.update(
            found_ref,
            {
                "status": "MATCHED",
                "matchedItemId": lost_id,
                "matchingConfidence": conf,
                "matchedDate": firestore.SERVER_TIMESTAMP,
                "ownerId": owner_id,
                "notificationSeen": False,
                "notificationRead": False,
                "reportOwner": found_report_owner,
            },
        )

        # Update lost item - keep its reportType
        transaction.update(
            lost_ref,
            {
                "status": "MATCHED",
                "matchedItemId": found_id,
                "matchingConfidence": conf,
                "matchedDate": firestore.SERVER_TIMESTAMP,
                "finderId": finder_id,
                "notificationSeen": False,
                "notificationRead": False,
                "reportOwner": lost_report_owner,  # Preserve reportType
            },
        )

    update_in_transaction(transaction, found_item_id, lost_item_id, confidence)

    print(
        f"Updated items {found_item_id} and {lost_item_id} as matched with notification flags"
    )


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
