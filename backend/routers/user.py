from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

# pyrefly: ignore [missing-import]
from db.database import get_db
# pyrefly: ignore [missing-import]
from models.profile import Profile
from pydantic import BaseModel

router = APIRouter(
    prefix="/user",
    tags=["User"]
)

class ProfileResponse(BaseModel):
    user_id: str
    mana_points: int
    last_refill_date: date

    class Config:
        from_attributes = True

@router.get("/{user_id}/profile", response_model=ProfileResponse)
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    today = date.today()
    
    if not profile:
        profile = Profile(user_id=user_id, mana_points=5, last_refill_date=today)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    else:
        # Check refill logic
        if profile.last_refill_date != today:
            profile.mana_points = 5
            profile.last_refill_date = today
            db.commit()
            db.refresh(profile)
            
    return profile
