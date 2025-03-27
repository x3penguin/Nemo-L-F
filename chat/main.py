from fastapi import FastAPI
from dotenv import load_dotenv
from chat.routes import router as chat_router
import os

load_dotenv()

app = FastAPI()
app.include_router(chat_router)

@app.get("/")
async def root():
    return {"message": "Chat Service API"}
