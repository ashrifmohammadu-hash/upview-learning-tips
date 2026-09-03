import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.auth import get_password_hash
from app import models

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Seed users
    author = models.User(email="author@example.com", hashed_password=get_password_hash("author123"), role="author")
    reviewer = models.User(email="reviewer@example.com", hashed_password=get_password_hash("reviewer123"), role="reviewer")
    session.add(author)
    session.add(reviewer)
    session.commit()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

@pytest.fixture(scope="function")
def author_token(client):
    response = client.post("/api/auth/login", data={"username": "author@example.com", "password": "author123"})
    return response.json()["access_token"]

@pytest.fixture(scope="function")
def reviewer_token(client):
    response = client.post("/api/auth/login", data={"username": "reviewer@example.com", "password": "reviewer123"})
    return response.json()["access_token"]
