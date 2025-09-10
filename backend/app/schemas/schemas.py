from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid


# User schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: uuid.UUID
    
    class Config:
        from_attributes = True


# Object schemas
class TableColumn(BaseModel):
    name: str
    type: str

class TableData(BaseModel):
    name: str
    columns: List[TableColumn]
    data: List[List[Any]]

class ObjectBase(BaseModel):
    name: str
    description: str
    type: str  # 'Item' | 'Document'
    attributes: Dict[str, Any] = {}
    tables: List[TableData] = []

class ObjectCreate(ObjectBase):
    pass

class ObjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None
    tables: Optional[List[TableData]] = None

class ObjectType(ObjectBase):
    id: uuid.UUID
    created_date: datetime
    modified_date: datetime
    revision: int
    
    class Config:
        from_attributes = True


# Relation schemas
class RelationBase(BaseModel):
    primary_object_id: uuid.UUID
    secondary_object_ids: List[uuid.UUID] = []
    relation_type: str
    description: Optional[str] = None

class RelationCreate(RelationBase):
    pass

class RelationUpdate(BaseModel):
    primary_object_id: Optional[uuid.UUID] = None
    secondary_object_ids: Optional[List[uuid.UUID]] = None
    relation_type: Optional[str] = None
    description: Optional[str] = None

class Relation(RelationBase):
    id: uuid.UUID
    
    class Config:
        from_attributes = True


# Hierarchy schemas
class HierarchyBase(BaseModel):
    parent_object_id: Optional[uuid.UUID] = None
    child_object_ids: List[uuid.UUID] = []
    level: int = 0
    properties: Dict[str, Any] = {}

class HierarchyCreate(HierarchyBase):
    pass

class HierarchyUpdate(BaseModel):
    parent_object_id: Optional[uuid.UUID] = None
    child_object_ids: Optional[List[uuid.UUID]] = None
    level: Optional[int] = None
    properties: Optional[Dict[str, Any]] = None

class Hierarchy(HierarchyBase):
    id: uuid.UUID
    
    class Config:
        from_attributes = True


# Chat schemas
class ChatMessage(BaseModel):
    id: str
    role: str  # 'user' | 'assistant'
    content: str
    timestamp: datetime

class ChatSessionBase(BaseModel):
    messages: List[ChatMessage] = []

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSession(ChatSessionBase):
    id: uuid.UUID
    created_date: datetime
    
    class Config:
        from_attributes = True


# API request/response schemas
class SearchRequest(BaseModel):
    query: str

class SearchResult(BaseModel):
    object: ObjectType
    relevance: float
    reasoning: str

class SearchResponse(BaseModel):
    results: List[SearchResult]
    query: str
    reasoning: str

class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    sessionId: str
