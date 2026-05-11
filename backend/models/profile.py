from sqlalchemy import Column, String, Integer, Date
from sqlalchemy.sql import func
# pyrefly: ignore [missing-import]
from db.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(String, primary_key=True, index=True)
    mana_points = Column(Integer, default=5)
    last_refill_date = Column(Date, default=func.current_date())
