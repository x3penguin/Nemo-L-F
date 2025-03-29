from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# More specific and secure CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",  # Your FastAPI server
        "http://localhost:8080",  # Frontend dev server
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8080",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Specific HTTP methods
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "Access-Control-Allow-Headers", 
        "Access-Control-Allow-Origin"
    ]
)