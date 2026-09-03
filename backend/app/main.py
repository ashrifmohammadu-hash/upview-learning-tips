from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import auth, tips

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Upview Learning Tips Inbox")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For take-home it's fine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tips.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Upview Learning Tips API"}
