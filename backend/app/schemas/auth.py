from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime


# Authentication schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "User"

class TokenData(BaseModel):
    username: Optional[str] = None

# Import User from schemas to avoid circular imports
from .schemas import User
LoginResponse.model_rebuild()
