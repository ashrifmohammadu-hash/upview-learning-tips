import pytest
from app.scoring import service

def test_scoring_failure(client, author_token):
    # Force failure
    service.set_simulate_failure(True)
    
    try:
        response = client.post("/api/tips", json={"body": "This tip will fail scoring"}, headers={"Authorization": f"Bearer {author_token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unscored"
        assert data["score"] is None
        assert data["body"] == "This tip will fail scoring"
        
        # Verify it exists in db
        res2 = client.get("/api/tips", headers={"Authorization": f"Bearer {author_token}"})
        assert len([t for t in res2.json() if t["id"] == data["id"]]) == 1
    finally:
        service.set_simulate_failure(False)
