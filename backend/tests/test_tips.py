def test_submit_valid_tip(client, author_token):
    response = client.post("/api/tips", json={"body": "Learn Python daily"}, headers={"Authorization": f"Bearer {author_token}"})
    assert response.status_code == 200
    assert response.json()["body"] == "Learn Python daily"
    assert response.json()["status"] == "pending"

def test_tip_over_280_rejected(client, author_token):
    long_body = "a" * 281
    response = client.post("/api/tips", json={"body": long_body}, headers={"Authorization": f"Bearer {author_token}"})
    assert response.status_code == 422

def test_empty_tip_rejected(client, author_token):
    response = client.post("/api/tips", json={"body": "   "}, headers={"Authorization": f"Bearer {author_token}"})
    assert response.status_code == 422

def test_duplicate_tip_rejected(client, author_token):
    body = "Test duplicate body"
    client.post("/api/tips", json={"body": body}, headers={"Authorization": f"Bearer {author_token}"})
    response2 = client.post("/api/tips", json={"body": body}, headers={"Authorization": f"Bearer {author_token}"})
    assert response2.status_code == 400

def test_author_cannot_approve(client, author_token):
    response = client.patch("/api/reviewer/tips/1/approve", headers={"Authorization": f"Bearer {author_token}"})
    assert response.status_code == 403

def test_author_cannot_reject(client, author_token):
    response = client.patch("/api/reviewer/tips/1/reject", json={"reason": "bad"}, headers={"Authorization": f"Bearer {author_token}"})
    assert response.status_code == 403

def test_author_cannot_access_reviewer_inbox(client, author_token):
    response = client.get("/api/reviewer/tips/pending", headers={"Authorization": f"Bearer {author_token}"})
    assert response.status_code == 403

def test_author_listing_returns_only_own(client, author_token, db):
    # submit one as author
    client.post("/api/tips", json={"body": "My tip"}, headers={"Authorization": f"Bearer {author_token}"})
    
    # submit one as reviewer (just to have another author)
    # the reviewer needs to act as author here for testing, or we just manually create one
    from app.models import Tip
    db.add(Tip(author_id=2, body="Reviewer tip", status="pending"))
    db.commit()

    response = client.get("/api/tips", headers={"Authorization": f"Bearer {author_token}"})
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["body"] == "My tip"

def test_reviewer_can_approve(client, author_token, reviewer_token):
    res = client.post("/api/tips", json={"body": "Tip to approve"}, headers={"Authorization": f"Bearer {author_token}"})
    tip_id = res.json()["id"]
    
    res2 = client.patch(f"/api/reviewer/tips/{tip_id}/approve", headers={"Authorization": f"Bearer {reviewer_token}"})
    assert res2.status_code == 200
    assert res2.json()["status"] == "approved"

def test_reviewer_cannot_reject_without_reason(client, author_token, reviewer_token):
    res = client.post("/api/tips", json={"body": "Tip to reject"}, headers={"Authorization": f"Bearer {author_token}"})
    tip_id = res.json()["id"]
    
    res2 = client.patch(f"/api/reviewer/tips/{tip_id}/reject", json={"reason": "   "}, headers={"Authorization": f"Bearer {reviewer_token}"})
    assert res2.status_code == 422

def test_reviewer_can_reject_with_reason(client, author_token, reviewer_token):
    res = client.post("/api/tips", json={"body": "Tip to reject 2"}, headers={"Authorization": f"Bearer {author_token}"})
    tip_id = res.json()["id"]
    
    res2 = client.patch(f"/api/reviewer/tips/{tip_id}/reject", json={"reason": "Not good enough"}, headers={"Authorization": f"Bearer {reviewer_token}"})
    assert res2.status_code == 200
    assert res2.json()["status"] == "rejected"
    assert res2.json()["review_note"] == "Not good enough"
