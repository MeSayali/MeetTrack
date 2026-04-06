from sqlalchemy.orm import Session
from backend.models.user import User
from backend.app import schemas
from backend.models.action_item import ActionItem
import json

# ✅ REGISTER
def create_user(db: Session, user: schemas.UserCreate):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return None

    db_user = User(
        full_name=user.full_name,
        email=user.email,
        password=user.password,
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# ✅ LOGIN
def login_user(db: Session, user: schemas.UserLogin):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        return None

    if db_user.password != user.password:
        return None

    return db_user


# ✅ UPDATE ACTION STATUS
def update_action_status(db: Session, action_id: int, status: str):
    action = db.query(ActionItem).filter(ActionItem.id == action_id).first()

    if not action:
        return None

    action.status = status
    db.commit()
    db.refresh(action)

    return action


# ✅ UPDATE USER PROFILE (COMPREHENSIVE)
def update_user_profile(db: Session, user_id: int, user_data: schemas.UserUpdate):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return None

    # 👤 Personal Information
    if getattr(user_data, 'full_name', None):
        user.full_name = user_data.full_name
    if getattr(user_data, 'phone_number', None) is not None:
        user.phone_number = user_data.phone_number
    if getattr(user_data, 'profile_image', None) is not None:
        user.profile_image = user_data.profile_image
    if getattr(user_data, 'bio', None) is not None:
        user.bio = user_data.bio

    # 💼 Professional Details
    if getattr(user_data, 'job_title', None) is not None:
        user.job_title = user_data.job_title
    if getattr(user_data, 'department', None) is not None:
        user.department = user_data.department
    if getattr(user_data, 'employee_id', None) is not None:
        user.employee_id = user_data.employee_id
    if getattr(user_data, 'manager_name', None) is not None:
        user.manager_name = user_data.manager_name
    
    skills_data = getattr(user_data, 'skills', None)
    if skills_data is not None:
        # Convert skills list to JSON string
        user.skills = json.dumps(skills_data) if skills_data else None

    # 📍 Location & Work Info
    if getattr(user_data, 'location', None) is not None:
        user.location = user_data.location
    if getattr(user_data, 'work_mode', None) is not None:
        user.work_mode = user_data.work_mode
    if getattr(user_data, 'timezone', None) is not None:
        user.timezone = user_data.timezone

    db.commit()
    db.refresh(user)

    return user