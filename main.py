import uvicorn
from fastapi import FastAPI
from chat.routes import router as chat_router
import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv

load_dotenv()

# # Initialize Firebase if not already initialized
# try:
#     firebase_admin.get_app()
# except ValueError:
#     cred = credentials.Certificate(os.getenv("SERVICE_KEY"))
#     firebase_admin.initialize_app(cred)

app = FastAPI(title="Lost and Found API")

# Include chat router
app.include_router(chat_router)

@app.get("/")
def read_root():
    return {"message": "Lost and Found API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)