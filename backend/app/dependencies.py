from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import auth, database, models

def get_current_user(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_author(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "author":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

def get_current_reviewer(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "reviewer":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
