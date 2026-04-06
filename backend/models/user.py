from sqlalchemy import Column, Integer, String, Text
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String(50), default="employee")

    # 👤 Personal Information
    phone_number = Column(String(20), nullable=True)
    profile_image = Column(String(500), nullable=True)  # File path or URL
    bio = Column(Text, nullable=True)

    # 💼 Professional Details
    job_title = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    employee_id = Column(String(100), nullable=True, unique=True)
    manager_name = Column(String(255), nullable=True)
    skills = Column(Text, nullable=True)  # JSON array stored as string: ["Python", "React", ...]

    # 📍 Location & Work Info
    location = Column(String(255), nullable=True)
    work_mode = Column(String(50), nullable=True)  # "Remote", "Hybrid", "Office"
    timezone = Column(String(100), nullable=True)