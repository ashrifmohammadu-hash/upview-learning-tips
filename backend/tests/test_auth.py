def test_login_success(client):
    response = client.post("/api/auth/login", data={"username": "author@example.com", "password": "author123"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", data={"username": "author@example.com", "password": "wrong"})
    assert response.status_code == 401

def test_register_success_and_login(client, db):
    # 1. Author can register successfully.
    # 9. Fake role field is ignored.
    res = client.post("/api/auth/register", json={
        "email": "newuser@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "role": "reviewer" # Should be ignored
    })
    assert res.status_code == 200

    # 2 & 3. Check DB for role and hash
    from app import models
    user = db.query(models.User).filter(models.User.email == "newuser@example.com").first()
    assert user is not None
    assert user.role == "author"
    assert user.hashed_password != "password123"
    assert str(user.hashed_password).startswith("$2b$")

    # 6 & 7. Can log in and receive JWT
    login_res = client.post("/api/auth/login", data={"username": "newuser@example.com", "password": "password123"})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
    token = login_res.json()["access_token"]

    # 8. Newly registered author can submit a tip
    tip_res = client.post("/api/tips", json={"body": "New user tip!"}, headers={"Authorization": f"Bearer {token}"})
    assert tip_res.status_code == 200

def test_register_duplicate_email(client):
    res = client.post("/api/auth/register", json={
        "email": "author@example.com", # already seeded
        "password": "password123",
        "confirm_password": "password123"
    })
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"]

def test_register_password_mismatch(client):
    res = client.post("/api/auth/register", json={
        "email": "mismatch@example.com",
        "password": "password123",
        "confirm_password": "wrongpassword"
    })
    assert res.status_code == 400
    assert "match" in res.json()["detail"].lower()
