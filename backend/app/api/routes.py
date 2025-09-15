from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.db.base import get_db
from app.services.database import DatabaseService
from app.services.ai_service import AIService
from app.services.report_service import ReportService
from app.schemas.schemas import (
    ObjectType, ObjectCreate, ObjectUpdate,
    Relation, RelationCreate, RelationUpdate,
    Hierarchy, HierarchyCreate, HierarchyUpdate,
    SearchRequest, SearchResponse,
    ChatRequest, ChatResponse, TypesCreate, TypesUpdate, TypesBase,
    RelationTypeCreate, RelationTypeBase, RelationTypeUpdate,
    HierarchyTypeBase, HierarchyTypeCreate, HierarchyTypeUpdate,
)
from app.core.config import settings
from app.api.auth import router as auth_router

router = APIRouter()

# Include auth routes
router.include_router(auth_router, prefix="/auth", tags=["auth"])

# Initialize services
ai_service = AIService(settings.openai_api_key) if settings.openai_api_key else None
report_service = ReportService()

# Dependency to get database service
def get_database_service(db: Session = Depends(get_db)) -> DatabaseService:
    return DatabaseService(db)

#Object Types endpoints
@router.get("/object-types", response_model=List[TypesBase])
async def get_object_types(db_service: DatabaseService = Depends(get_database_service)):
    """Get all object types"""
    return db_service.get_object_types()

@router.get("/object-types/{type_id}", response_model=TypesBase)
async def get_object_type(type_id: str, db_service: DatabaseService = Depends(get_database_service)):
    """Get a specific object type by ID"""
    try:
        uuid_obj = uuid.UUID(type_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid type ID format")
    
    obj_type = db_service.get_object_type(uuid_obj)
    if not obj_type:
        raise HTTPException(status_code=404, detail="Object type not found")
    return obj_type

@router.get("/object-types/by-name/{type_name}", response_model=int)
async def get_object_type_by_name(type_name: str, db_service: DatabaseService = Depends(get_database_service)):
    """Get a specific object type by name"""
    obj_type_id = db_service.get_object_type_by_name(type_name)
    if not obj_type_id:
        raise HTTPException(status_code=404, detail="Object type not found")
    return obj_type_id

@router.post("/object-types", response_model=TypesBase, status_code=201)
async def create_object_type(type_data: TypesCreate, db_service: DatabaseService = Depends(get_database_service)):
    """Create a new object type"""
    return db_service.create_object_type(type_data)

@router.put("/object-types/{type_id}", response_model=TypesBase)
async def update_object_type(
    type_id: int, 
    type_data: TypesUpdate, 
    db_service: DatabaseService = Depends(get_database_service)
):
    """Update an existing object type"""
    try:
        uuid_obj = type_id
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid type ID format")
    
    updated_type = db_service.update_object_type(uuid_obj, type_data)
    if not updated_type:
        raise HTTPException(status_code=404, detail="Object type not found")
    return updated_type

@router.delete("/object-types/{type_id}", status_code=204)
async def delete_object_type(type_id: int, db_service: DatabaseService = Depends(get_database_service)):
    """Delete an object type"""
    try:
        uuid_obj = type_id
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid type ID format")
    
    if not db_service.delete_object_type(uuid_obj):
        raise HTTPException(status_code=404, detail="Object type not found")
    
# Objects endpoints
@router.get("/objects", response_model=List[ObjectType])
async def get_objects(db_service: DatabaseService = Depends(get_database_service)):
    """Get all objects"""
    return db_service.get_objects()

@router.get("/objects/{object_id}", response_model=ObjectType)
async def get_object(object_id: str, db_service: DatabaseService = Depends(get_database_service)):
    """Get a specific object by ID"""
    try:
        uuid_obj = uuid.UUID(object_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid object ID format")
    
    obj = db_service.get_object(uuid_obj)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj

@router.post("/objects", response_model=ObjectType, status_code=201)
async def create_object(object_data: ObjectCreate, db_service: DatabaseService = Depends(get_database_service)):
    """Create a new object"""
    return db_service.create_object(object_data)

@router.put("/objects/{object_id}", response_model=ObjectType)
async def update_object(
    object_id: str, 
    object_data: ObjectUpdate, 
    db_service: DatabaseService = Depends(get_database_service)
):
    """Update an existing object"""
    try:
        uuid_obj = uuid.UUID(object_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid object ID format")
    
    updated_obj = db_service.update_object(uuid_obj, object_data)
    if not updated_obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return updated_obj

@router.delete("/objects/{object_id}", status_code=204)
async def delete_object(object_id: str, db_service: DatabaseService = Depends(get_database_service)):
    """Delete an object"""
    try:
        uuid_obj = uuid.UUID(object_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid object ID format")
    
    if not db_service.delete_object(uuid_obj):
        raise HTTPException(status_code=404, detail="Object not found")

# Relation Types endpoints
@router.get("/relation-types", response_model=List[RelationTypeBase])
async def get_relation_types(db_service: DatabaseService = Depends(get_database_service)):
    """Get all relation types"""
    return db_service.get_relation_types()

@router.get("/relation-types/{relation_type}", response_model=str)
async def get_relation_type(relation_type: str, db_service: DatabaseService = Depends(get_database_service)):
    """Get a specific relation type"""
    if relation_type not in db_service.get_relation_types():
        raise HTTPException(status_code=404, detail="Relation type not found")
    return relation_type

@router.post("/relation-types", response_model=RelationTypeBase, status_code=201)
async def create_relation_type(relation_type_data: RelationTypeCreate, db_service: DatabaseService = Depends(get_database_service)):
    """Create a new relation type"""
    return db_service.create_relation_type(relation_type_data)

@router.put("/relation-types/{relation_type_id}", response_model=RelationTypeBase)
async def update_relation_type(
    relation_type_id: int, 
    relation_type_data: RelationTypeUpdate,
    db_service: DatabaseService = Depends(get_database_service)
):
    updated = db_service.update_relation_type(relation_type_id, relation_type_data)
    if not updated:
        raise HTTPException(status_code=404, detail="RelationType not found")
    return updated

@router.delete("/relation-types/{relation_type_id}", response_model=RelationTypeBase)
async def delete_relation_type(
    relation_type_id: int,
    db_service: DatabaseService = Depends(get_database_service),
):
    deleted = db_service.delete_relation_type(relation_type_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="RelationType not found")
    return deleted

# Relations endpoints
@router.get("/relations", response_model=List[Relation])
async def get_relations(db_service: DatabaseService = Depends(get_database_service)):
    """Get all relations"""
    return db_service.get_relations()

@router.get("/objects/{object_id}/relations", response_model=List[Relation])
async def get_object_relations(object_id: str, db_service: DatabaseService = Depends(get_database_service)):
    """Get relations for a specific object"""
    try:
        uuid_obj = uuid.UUID(object_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid object ID format")
    
    return db_service.get_object_relations(uuid_obj)

@router.post("/relations", response_model=Relation, status_code=201)
async def create_relation(relation_data: RelationCreate, db_service: DatabaseService = Depends(get_database_service)):
    """Create a new relation"""
    return db_service.create_relation(relation_data)

@router.put("/relations/{relation_id}", response_model=Relation)
async def update_relation(
    relation_id: str, 
    relation_data: RelationUpdate, 
    db_service: DatabaseService = Depends(get_database_service)):
    """Update an existing relation"""
    try:
        uuid_obj = uuid.UUID(relation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid relation ID format")
    
    updated_relation = db_service.update_relation(uuid_obj, relation_data)
    if not updated_relation:
        raise HTTPException(status_code=404, detail="Relation not found")
    return updated_relation

@router.delete("/relations/{relation_id}", status_code=204)
async def delete_relation(relation_id: str, db_service: DatabaseService = Depends(get_database_service)):
    """Delete a relation"""
    try:
        uuid_obj = uuid.UUID(relation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid relation ID format")
    
    if not db_service.delete_relation(uuid_obj):
        raise HTTPException(status_code=404, detail="Relation not found")

# Hierarchy Types endpoints
@router.get("/hierarchy-types", response_model=List[HierarchyTypeBase])
async def get_hierarchy_types(
    db_service: DatabaseService = Depends(get_database_service)
):
    return db_service.get_hierarchy_types()

@router.get("/hierarchy-types/{object_id}", response_model=HierarchyTypeBase)
async def get_hierarchy_type_by_object(
    object_id: int,
    db_service: DatabaseService = Depends(get_database_service),
):
    hierarchy = db_service.get_hierarchy_type_by_object(object_id)
    if not hierarchy:
        raise HTTPException(status_code=404, detail="HierarchyType not found")
    return hierarchy

@router.post("/hierarchy-types", response_model=HierarchyTypeBase)
async def create_hierarchy_type(
    hierarchy_data: HierarchyTypeCreate,
    db_service: DatabaseService = Depends(get_database_service),
):
    created = db_service.create_hierarchy_type(hierarchy_data)
    return created

@router.put("/hierarchy-types/{hierarchy_id}", response_model=HierarchyTypeBase)
async def update_hierarchy_type(
    hierarchy_id: int,
    hierarchy_data: HierarchyTypeUpdate,
    db_service: DatabaseService = Depends(get_database_service),
):
    updated = db_service.update_hierarchy_type(hierarchy_id, hierarchy_data)
    if not updated:
        raise HTTPException(status_code=404, detail="HierarchyType not found")
    return updated

# Hierarchy endpoints
@router.get("/hierarchies", response_model=List[Hierarchy])
async def get_hierarchies(db_service: DatabaseService = Depends(get_database_service)):
    """Get all hierarchies"""
    return db_service.get_hierarchies()

@router.get("/objects/{object_id}/hierarchy", response_model=List[Hierarchy])
async def get_object_hierarchy(object_id: str, db_service: DatabaseService = Depends(get_database_service)):
    """Get hierarchy for a specific object"""
    try:
        uuid_obj = uuid.UUID(object_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid object ID format")
    
    return db_service.get_object_hierarchy(uuid_obj)

@router.post("/hierarchies", response_model=Hierarchy, status_code=201)
async def create_hierarchy(hierarchy_data: HierarchyCreate, db_service: DatabaseService = Depends(get_database_service)):
    """Create a new hierarchy"""
    return db_service.create_hierarchy(hierarchy_data)

# AI Search endpoint
@router.post("/search", response_model=SearchResponse)
async def search_objects(
    search_request: SearchRequest, 
    db_service: DatabaseService = Depends(get_database_service)
):
    """AI-powered semantic search across objects"""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        return await ai_service.search_objects(search_request.query, db_service)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# Chat endpoint
@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest, 
    db_service: DatabaseService = Depends(get_database_service)
):
    """AI chat with object context awareness"""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        return await ai_service.chat_with_context(
            chat_request.message, 
            chat_request.sessionId or "", 
            db_service
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

# Reports endpoints
@router.get("/reports/{report_type}")
async def generate_report(
    report_type: str,
    background_tasks: BackgroundTasks,
    db_service: DatabaseService = Depends(get_database_service)
):
    """Generate PDF reports"""
    valid_types = ["objects", "relations", "hierarchies", "full"]
    if report_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid report type")
    
    # Get data
    objects = db_service.get_objects()
    relations = db_service.get_relations()
    hierarchies = db_service.get_hierarchies()
    
    # Generate appropriate report
    if report_type == "objects":
        pdf_buffer = report_service.generate_objects_report(objects)
    elif report_type == "relations":
        pdf_buffer = report_service.generate_relations_report(relations, objects)
    elif report_type == "hierarchies":
        pdf_buffer = report_service.generate_hierarchies_report(hierarchies, objects)
    else:  # full
        pdf_buffer = report_service.generate_full_report(objects, relations, hierarchies)
    
    # Return PDF file
    from fastapi.responses import StreamingResponse
    import io
    
    def generate():
        yield pdf_buffer.getvalue()
    
    filename = f"object-design-{report_type}-report-{datetime.now().strftime('%Y-%m-%d')}.pdf"
    
    return StreamingResponse(
        generate(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
