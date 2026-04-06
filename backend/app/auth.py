from datetime import datetime, timedelta
from jose import JWTError, jwt

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from backend.app.database import SessionLocal
from backend.app.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from backend.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ✅ Create Token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


# ✅ Verify Token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")

    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user