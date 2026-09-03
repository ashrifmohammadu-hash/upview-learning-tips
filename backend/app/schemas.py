from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

class TipCreate(BaseModel):
    body: str

    @field_validator('body')
    def trim_and_validate_length(cls, v):
        trimmed = v.strip()
        if len(trimmed) == 0:
            raise ValueError("Tip body cannot be empty.")
        if len(trimmed) > 280:
            raise ValueError("Tip body cannot exceed 280 characters.")
        return trimmed

class TipResponse(BaseModel):
    id: int
    author_id: int
    body: str
    status: str
    created_at: datetime
    score: Optional[int] = None
    flags: Optional[List[str]] = []
    review_note: Optional[str] = None

    class Config:
        from_attributes = True

class RejectTipRequest(BaseModel):
    reason: str

    @field_validator('reason')
    def validate_reason(cls, v):
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Rejection reason is required.")
        return trimmed

class Token(BaseModel):
    access_token: str
    token_type: str
