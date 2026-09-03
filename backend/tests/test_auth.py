def test_login_success(client):
    response = client.post("/api/auth/login", data={"username": "author@example.com", "password": "author123"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", data={"username": "author@example.com", "password": "wrong"})
    assert response.status_code == 401
