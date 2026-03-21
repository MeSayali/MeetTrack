from sqlalchemy import Column, Integer, String
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)   # ✅ NEW
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String(50), default="employee")     # ✅ NEW

    
    # ✅ NEW PROFILE FIELDS
    job_title = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    timezone = Column(String(100), nullable=True)