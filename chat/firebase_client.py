from chat.firebase import db

def get_item_by_id(item_id):
    """Fetch an item from Firestore by ID"""
    doc = db.collection("items").document(item_id).get()
    if doc.exists:
        return doc.to_dict()
    return None
