from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, List
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        # Map of user_id to set of websocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map of websocket to user_id
        self.connection_user: Dict[WebSocket, str] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        self.connection_user[websocket] = user_id
        
    def disconnect(self, websocket: WebSocket):
        user_id = self.connection_user.get(websocket)
        
        if user_id:
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            if websocket in self.connection_user:
                del self.connection_user[websocket]
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send a message to a specific user on all their active connections"""
        if user_id in self.active_connections:
            # Convert message to JSON
            message_json = json.dumps(message)
            
            # Send to all connections for this user
            websockets = self.active_connections[user_id]
            for websocket in list(websockets):  # Create a copy to avoid modification during iteration
                try:
                    await websocket.send_text(message_json)
                except WebSocketDisconnect:
                    self.disconnect(websocket)
                except Exception as e:
                    print(f"Error sending message to websocket: {e}")
                    self.disconnect(websocket)

# Create a global connection manager
manager = ConnectionManager()