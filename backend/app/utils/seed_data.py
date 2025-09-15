import uuid
from datetime import datetime
from app.models.models import ObjectType, Relation, Hierarchy
from app.schemas.schemas import ObjectCreate, RelationCreate, HierarchyCreate


def get_sample_objects():
    """Get sample objects for seeding the database"""
    return [
        ObjectCreate(
            name="User Management System",
            description="Comprehensive user management and authentication system with role-based access control and audit logging capabilities.",
            type="Item",
            attributes={"status": "Active", "version": "2.1.0"},
            tables=[
                {
                    "name": "User Permissions",
                    "columns": [
                        {"name": "User ID", "type": "string"},
                        {"name": "Username", "type": "string"},
                        {"name": "Role", "type": "string"},
                        {"name": "Permissions", "type": "string"},
                        {"name": "Last Login", "type": "string"}
                    ],
                    "data": [
                        ["USR001", "admin@company.com", "Administrator", "Full Access", "2024-01-15 09:30"],
                        ["USR002", "manager@company.com", "Manager", "Read/Write", "2024-01-14 16:45"],
                        ["USR003", "user@company.com", "User", "Read Only", "2024-01-13 11:20"]
                    ]
                }
            ]
        ),
        ObjectCreate(
            name="Product Catalog",
            description="Complete product information system with pricing and inventory tracking.",
            type="Document",
            attributes={"status": "Active", "itemCount": "1,247"},
            tables=[]
        ),
        ObjectCreate(
            name="Configuration",
            description="System configuration and settings management.",
            type="Item",
            attributes={"status": "Active", "configCount": "87"},
            tables=[]
        ),
        ObjectCreate(
            name="API Documentation",
            description="Complete API reference and integration guides.",
            type="Document",
            attributes={"status": "Draft", "pageCount": "156"},
            tables=[]
        )
    ]


def get_sample_relations():
    """Get sample relations for seeding the database"""
    return [
        RelationCreate(
            primary_object_id=uuid.UUID('12345678-1234-5678-9012-123456789012'),  # Will be set dynamically
            secondary_object_ids=[],  # Will be set dynamically
            relation_type="Item-to-Document",
            description="User management connects to product catalog for user-specific product access"
        ),
        RelationCreate(
            primary_object_id=uuid.UUID('12345678-1234-5678-9012-123456789012'),  # Will be set dynamically
            secondary_object_ids=[],  # Will be set dynamically
            relation_type="Item-to-Item",
            description="User management uses system configuration for authentication settings"
        )
    ]


def get_sample_hierarchies():
    """Get sample hierarchies for seeding the database"""
    return [
        HierarchyCreate(
            parent_object_id=uuid.UUID('12345678-1234-5678-9012-123456789012'),  # Will be set dynamically
            child_object_ids=[],  # Will be set dynamically
            level=0,
            properties={"type": "Root", "priority": 1}
        )
    ]


def seed_database(db_service):
    """Seed the database with sample data"""
    print("Seeding database with sample data...")
    
    # Create default admin user
    try:
        existing_admin = db_service.get_user_by_username('admin')
        if not existing_admin:
            admin_user = db_service.create_user({
                "username": "admin",
                "password": "admin123"  # In production, this should be hashed
            })
            print(f"Created default admin user: {admin_user.username}")
    except Exception as e:
        print(f"Warning: Could not create admin user: {e}")
    
    # Create objects
    objects = []
    sample_objects = get_sample_objects()
    
    for obj_data in sample_objects:
        obj = db_service.create_object(obj_data)
        objects.append(obj)
        print(f"Created object: {obj.name}")
    
    # Create relations
    if len(objects) >= 2:
        relations_data = get_sample_relations()
        relations_data[0].primary_object_id = objects[0].id
        relations_data[0].secondary_object_ids = [str(objects[1].id)]
        relations_data[1].primary_object_id = objects[0].id
        relations_data[1].secondary_object_ids = [str(objects[2].id)]
        
        for relation_data in relations_data:
            relation = db_service.create_relation(relation_data)
            print(f"Created relation: {relation.relation_type}")
    
    # Create hierarchies
    if objects:
        hierarchies_data = get_sample_hierarchies()
        hierarchies_data[0].parent_object_id = objects[0].id
        hierarchies_data[0].child_object_ids = [str(uuid.uuid4()) for _ in range(2)]  # Mock child IDs
        
        for hierarchy_data in hierarchies_data:
            hierarchy = db_service.create_hierarchy(hierarchy_data)
            print(f"Created hierarchy for: {objects[0].name}")
    
    print("Database seeding completed!")
