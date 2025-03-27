from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from typing import List, Optional
import json

from . import database as chat_db
from . import schemas
from .websocket_manager import manager

router = APIRouter(prefix="/chat", tags=["chat"])
security = HTTPBearer()

# Helper to validate Firebase token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]
        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Get all chats for the current user
@router.get("/", response_model=List[schemas.ChatMetadata])
async def get_user_chats(user_id: str = Depends(get_current_user)):
    return chat_db.get_user_chats(user_id)

# Get a specific chat with messages
@router.get("/{chat_id}", response_model=schemas.Chat)
async def get_chat(
    chat_id: str, 
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(get_current_user)
):
    chat = chat_db.get_chat(chat_id)
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Check if user is a participant
    if user_id not in chat["participants"]:
        raise HTTPException(status_code=403, detail="You don't have access to this chat")
    
    # Mark messages as read
    chat_db.mark_messages_as_read(chat_id, user_id)
    
    # Get messages
    messages = chat_db.get_messages(chat_id, limit)
    
    # Combine chat metadata with messages
    return {**chat, "id": chat_id, "messages": messages}

# Create a new chat
@router.post("/", response_model=schemas.ChatMetadata)
async def create_chat(request: schemas.ChatCreateRequest, user_id: str = Depends(get_current_user)):
    from firebase_client import get_item_by_id
    
    # Get item details
    item = get_item_by_id(request.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Determine the other user id (owner or finder)
    other_user_id = None
    if item.get("status") == "MATCHED":
        if item.get("ownerId") == user_id:
            other_user_id = item.get("finderId")
        elif item.get("finderId") == user_id:
            other_user_id = item.get("ownerId")
    else:
        raise HTTPException(status_code=400, detail="Item is not matched yet")
    
    if not other_user_id:
        raise HTTPException(status_code=400, detail="Cannot determine chat participant")
    
    # Create chat
    chat_id = chat_db.create_chat(user_id, other_user_id, request.item_id)
    
    # Get chat details
    chat = chat_db.get_chat(chat_id)
    return {**chat, "id": chat_id}

# WebSocket endpoint for chat
@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        # Verify token
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]
        
        # Accept connection
        await manager.connect(websocket, user_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Validate message structure
                if not all(k in message_data for k in ["chat_id", "receiver_id", "content"]):
                    await websocket.send_text(json.dumps({
                        "error": "Invalid message format. Required: chat_id, receiver_id, content"
                    }))
                    continue
                
                # Get chat details
                chat = chat_db.get_chat(message_data["chat_id"])
                if not chat:
                    await websocket.send_text(json.dumps({"error": "Chat not found"}))
                    continue
                
                # Check if user is participant
                if user_id not in chat["participants"]:
                    await websocket.send_text(json.dumps({"error": "You don't have access to this chat"}))
                    continue
                
                # Save message
                message_id = chat_db.save_message(
                    message_data["chat_id"], 
                    user_id, 
                    message_data["receiver_id"], 
                    message_data["content"]
                )
                
                # Get timestamp for the saved message
                messages = chat_db.get_messages(message_data["chat_id"], limit=1)
                if messages:
                    message = messages[0]
                    
                    # Send message to receiver
                    await manager.send_personal_message(
                        message,
                        message_data["receiver_id"]
                    )
                    
                    # Send confirmation to sender
                    await websocket.send_text(json.dumps({
                        "status": "sent",
                        "message": message
                    }))
                
        except WebSocketDisconnect:
            manager.disconnect(websocket)
        
    except Exception as e:
        # Handle invalid token
        try:
            await websocket.close(code=1008, reason=f"Authentication failed: {str(e)}")
        except:
            # Socket might already be closed
            pass