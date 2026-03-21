from sqlalchemy.orm import Session
from backend.models.user import User
from backend.app import schemas

from backend.models.action_item import ActionItem

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

def update_action_status(db: Session, action_id: int, status: str):
    action = db.query(ActionItem).filter(ActionItem.id == action_id).first()

    if not action:
        return None

    action.status = status
    db.commit()
    db.refresh(action)

    return action


from backend.models.user import User

def update_user_profile(db, user_id: int, user_data):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return None

    # Update only provided fields
    if user_data.full_name:
        user.full_name = user_data.full_name
    if user_data.job_title:
        user.job_title = user_data.job_title
    if user_data.department:
        user.department = user_data.department
    if user_data.location:
        user.location = user_data.location
    if user_data.timezone:
        user.timezone = user_data.timezone

    db.commit()
    db.refresh(user)

    return user