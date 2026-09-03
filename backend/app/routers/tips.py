from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from .. import database, models, schemas, dependencies
from ..scoring import service as scoring_service

router = APIRouter(tags=["tips"])

@router.post("/api/tips", response_model=schemas.TipResponse)
def submit_tip(tip: schemas.TipCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Must be authenticated, any user can submit technically but prompt implies authors submit. 
    # Let's allow authors, though reviewers technically could if they wanted, but let's restrict to authors or anyone authenticated.
    # The requirement says "Only authenticated users can submit tips." We'll just enforce authenticated.
    
    body = tip.body.strip()
    
    # Check duplicates: same author, same body, within 24 hours
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    duplicate = db.query(models.Tip).filter(
        models.Tip.author_id == current_user.id,
        models.Tip.body == body,
        models.Tip.created_at >= twenty_four_hours_ago
    ).first()
    
    if duplicate:
        raise HTTPException(status_code=400, detail="You already submitted this tip within the last 24 hours.")

    new_tip = models.Tip(
        author_id=current_user.id,
        body=body,
        status="pending"
    )
    
    try:
        score_result = scoring_service.score_tip(body)
        new_tip.score = score_result["score"]
        new_tip.flags = score_result["flags"]
        new_tip.status = "pending"
    except Exception:
        new_tip.status = "unscored"
        new_tip.score = None
        new_tip.flags = []
        
    db.add(new_tip)
    db.commit()
    db.refresh(new_tip)
    
    return new_tip

@router.get("/api/tips", response_model=List[schemas.TipResponse])
def get_own_tips(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_author)):
    tips = db.query(models.Tip).filter(models.Tip.author_id == current_user.id).order_by(models.Tip.created_at.desc()).all()
    return tips

@router.get("/api/reviewer/tips/pending", response_model=List[schemas.TipResponse])
def get_pending_tips(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_reviewer)):
    tips = db.query(models.Tip).filter(models.Tip.status.in_(["pending", "unscored"])).order_by(models.Tip.created_at.asc()).all()
    return tips

@router.patch("/api/reviewer/tips/{tip_id}/approve", response_model=schemas.TipResponse)
def approve_tip(tip_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_reviewer)):
    tip = db.query(models.Tip).filter(models.Tip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
        
    if tip.status == "approved":
        return tip
    if tip.status == "rejected":
        raise HTTPException(status_code=400, detail="Cannot approve a rejected tip.")
        
    # Concurrent safety
    updated_count = db.query(models.Tip).filter(
        models.Tip.id == tip_id,
        models.Tip.status.in_(["pending", "unscored"])
    ).update({"status": "approved"}, synchronize_session=False)
    
    db.commit()
    
    if updated_count == 0:
        raise HTTPException(status_code=409, detail="Conflict: tip state was changed by another reviewer.")
        
    db.refresh(tip)
    return tip

@router.patch("/api/reviewer/tips/{tip_id}/reject", response_model=schemas.TipResponse)
def reject_tip(tip_id: int, req: schemas.RejectTipRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_reviewer)):
    tip = db.query(models.Tip).filter(models.Tip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
        
    if tip.status == "rejected" and tip.review_note == req.reason:
        return tip
        
    updated_count = db.query(models.Tip).filter(
        models.Tip.id == tip_id,
        models.Tip.status.in_(["pending", "unscored", "approved"])
    ).update({"status": "rejected", "review_note": req.reason}, synchronize_session=False)
    
    db.commit()
    
    if updated_count == 0:
        raise HTTPException(status_code=409, detail="Conflict: could not update tip status.")
        
    db.refresh(tip)
    return tip

@router.patch("/api/reviewer/tips/{tip_id}/reopen", response_model=schemas.TipResponse)
def reopen_tip(tip_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_reviewer)):
    tip = db.query(models.Tip).filter(models.Tip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
        
    if tip.status != "rejected":
        raise HTTPException(status_code=400, detail="Can only reopen rejected tips.")
        
    tip.status = "pending"
    tip.review_note = None
    db.commit()
    db.refresh(tip)
    return tip
