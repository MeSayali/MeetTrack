from pydantic import BaseModel, EmailStr
from typing import Optional, List


# ✅ Register Schema
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str   # manager / employee


# ✅ Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ✅ Complete User Response Schema
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    
    # 👤 Personal Information
    phone_number: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    
    # 💼 Professional Details
    job_title: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    manager_name: Optional[str] = None
    skills: Optional[str] = None  # JSON array as string

    # 📍 Location & Work Info
    location: Optional[str] = None
    work_mode: Optional[str] = None
    timezone: Optional[str] = None

    class Config:
        from_attributes = True


# ✅ Profile Update Schema
class UserUpdate(BaseModel):
    # 👤 Personal Information
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    
    # 💼 Professional Details
    job_title: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    manager_name: Optional[str] = None
    skills: Optional[List[str]] = None  # Array of skills

    # 📍 Location & Work Info
    location: Optional[str] = None
    work_mode: Optional[str] = None
    timezone: Optional[str] = None