from pydantic import BaseModel, EmailStr
from typing import Optional


# ✅ Register Schema
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str   # manager / employee


# ✅ Response Schema
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# ✅ Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    job_title: Optional[str]
    department: Optional[str]
    location: Optional[str]
    timezone: Optional[str]