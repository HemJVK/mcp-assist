from fastapi import FastAPI
from app.routers import email_router

app = FastAPI(title="Intelligent Automation Backend")

app.include_router(email_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Intelligent Automation Backend"}
