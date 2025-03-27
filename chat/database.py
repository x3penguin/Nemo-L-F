from firebase_admin import credentials, firestore
from chat.firebase import db
from datetime import datetime
import uuid

def create_chat(user1_id, user2_id, item_id):
    """Create a new chat between two users about a specific item"""
    # Create a unique chat ID
    chat_id = str(uuid.uuid4())
    
    # Check if chat already exists between these users for this item
    chats_ref = db.collection("chats")
    query = chats_ref.where("participants", "array_contains", user1_id).where("itemId", "==", item_id)
    
    for doc in query.stream():
        chat_data = doc.to_dict()
        if user2_id in chat_data.get("participants", []):
            return doc.id  # Chat already exists
    
    # Create new chat
    chat_data = {
        "participants": [user1_id, user2_id],
        "itemId": item_id,
        "created_at": firestore.SERVER_TIMESTAMP,
        "last_message": "",
        "last_message_time": firestore.SERVER_TIMESTAMP
    }
    chats_ref.document(chat_id).set(chat_data)
    
    return chat_id

def get_chat(chat_id):
    """Get chat by ID"""
    chat_ref = db.collection("chats").document(chat_id)
    chat = chat_ref.get()
    
    if chat.exists:
        chat_data = chat.to_dict()
        chat_data["id"] = chat.id
        return chat_data
    return None

def save_message(chat_id, sender_id, receiver_id, content):
    """Save a message to the chat"""
    message_id = str(uuid.uuid4())
    
    # Create message data
    message_data = {
        "sender": sender_id,
        "receiver": receiver_id,
        "content": content,
        "timestamp": firestore.SERVER_TIMESTAMP,
        "read": False
    }
    
    # Add message to chat
    db.collection("chats").document(chat_id).collection("messages").document(message_id).set(message_data)
    
    # Update chat metadata
    db.collection("chats").document(chat_id).update({
        "last_message": content,
        "last_message_time": firestore.SERVER_TIMESTAMP
    })
    
    return message_id

def get_messages(chat_id, limit=50):
    """Get messages for a chat, with optional limit"""
    messages_ref = db.collection("chats").document(chat_id).collection("messages")
    query = messages_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit)
    
    messages = []
    for doc in query.stream():
        message_data = doc.to_dict()
        message_data["id"] = doc.id
        messages.append(message_data)
    
    # Return in chronological order
    return list(reversed(messages))

def get_user_chats(user_id):
    """Get all chats for a user"""
    chats_ref = db.collection("chats")
    query = chats_ref.where("participants", "array_contains", user_id)
    
    chats = []
    for doc in query.stream():
        chat_data = doc.to_dict()
        chat_data["id"] = doc.id
        chats.append(chat_data)
    
    return chats

def mark_messages_as_read(chat_id, user_id):
    """Mark all messages sent to the user as read"""
    messages_ref = db.collection("chats").document(chat_id).collection("messages")
    query = messages_ref.where("receiver", "==", user_id).where("read", "==", False)
    
    batch = db.batch()
    count = 0
    
    for doc in query.stream():
        batch.update(doc.reference, {"read": True})
        count += 1
        
        # Firebase has a limit of 500 operations per batch
        if count >= 400:
            batch.commit()
            batch = db.batch()
            count = 0
    
    if count > 0:
        batch.commit()