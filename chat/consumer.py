import asyncio
import websockets
import json
import firebase_admin
from firebase_admin import credentials, auth
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate(os.getenv("SERVICE_KEY"))
    firebase_admin.initialize_app(cred)

FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")

async def get_id_token(user_id):
    """Exchange custom token for ID token using Firebase REST API."""
    try:
        # Create a custom token for the user
        custom_token = auth.create_custom_token(user_id).decode('utf-8')

        # Exchange the custom token for an ID token
        response = requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={FIREBASE_API_KEY}",
            json={"token": custom_token, "returnSecureToken": True}
        )

        if response.status_code == 200:
            id_token = response.json().get("idToken")
            print(id_token)
            print("Successfully retrieved ID token.")
            return id_token
        else:
            print(f"Error exchanging token: {response.json()}")
            return None
    except Exception as e:
        print(f"Error creating or exchanging token: {e}")
        return None

async def consumer(user_id, token):
    """Test WebSocket connection."""
    uri = f"ws://localhost:8000/chat/ws/{token}"

    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected as user {user_id}")

            # Example message sending
            chat_id = input("Enter chat ID: ")
            receiver_id = input("Enter receiver ID: ")

            while True:
                message = input("Enter message (or 'exit' to quit): ")
                if message.lower() == 'exit':
                    break

                await websocket.send(json.dumps({
                    "chat_id": chat_id,
                    "receiver_id": receiver_id,
                    "content": message
                }))

                # Wait for response
                response = await websocket.recv()
                print(f"Received: {json.loads(response)}")

    except websockets.exceptions.WebSocketException as e:
        print(f"WebSocket Error: {e}")
    except Exception as e:
        print(f"Unexpected Error: {e}")

async def main():
    user_id = input("Enter your user ID: ")
    token = await get_id_token(user_id)

    if token:
        await consumer(user_id, token)
    else:
        print("Failed to get token")

if __name__ == "__main__":
    asyncio.run(main())
