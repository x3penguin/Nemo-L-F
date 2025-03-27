from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageCreate(BaseModel):
    content: str

class Message(BaseModel):
    id: str
    sender: str
    receiver: str
    content: str
    timestamp: datetime
    read: bool

class ChatMetadata(BaseModel):
    id: str
    participants: List[str]
    item_id: str
    createdAt: datetime
    lastMessage: str
    lastMessageTime: datetime

class Chat(ChatMetadata):
    messages: List[Message] = []

class ChatCreateRequest(BaseModel):
    user_id: str
    item_id: str