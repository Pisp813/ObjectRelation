from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.base import get_db
from app.services.database import DatabaseService
from app.schemas.schemas import User

router = APIRouter()

# Pydantic models for auth
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: User = None

# Dependency to get database service
def get_database_service(db: Session = Depends(get_db)) -> DatabaseService:
    return DatabaseService(db)

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db_service: DatabaseService = Depends(get_database_service)):
    """Authenticate user with username and password"""
    try:
        user = db_service.get_user_by_username(login_data.username)
        
        if not user:
            return LoginResponse(
                success=False,
                message="User not found",
                user=None
            )
        
        if user.password != login_data.password:
            return LoginResponse(
                success=False,
                message="Invalid password",
                user=None
            )
        
        return LoginResponse(
            success=True,
            message="Login successful",
            user=user
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/register", response_model=User)
async def register(user_data: LoginRequest, db_service: DatabaseService = Depends(get_database_service)):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = db_service.get_user_by_username(user_data.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Create new user
        new_user = db_service.create_user({
            "username": user_data.username,
            "password": user_data.password  # Note: In production, you should hash passwords
        })
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
