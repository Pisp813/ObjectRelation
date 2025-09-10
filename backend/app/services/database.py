from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.models import ObjectType, Relation, Hierarchy, ChatSession, User
from app.schemas.schemas import (
    ObjectCreate, ObjectUpdate, RelationCreate, RelationUpdate,
    HierarchyCreate, HierarchyUpdate, ChatSessionCreate
)
import uuid
from datetime import datetime


class DatabaseService:
    def __init__(self, db: Session):
        self.db = db

    # Object methods
    def get_objects(self) -> List[ObjectType]:
        return self.db.query(ObjectType).all()

    def get_object(self, object_id: uuid.UUID) -> Optional[ObjectType]:
        return self.db.query(ObjectType).filter(ObjectType.id == object_id).first()

    def create_object(self, object_data: ObjectCreate) -> ObjectType:
        db_object = ObjectType(**object_data.model_dump())
        self.db.add(db_object)
        self.db.commit()
        self.db.refresh(db_object)
        return db_object

    def update_object(self, object_id: uuid.UUID, object_data: ObjectUpdate) -> Optional[ObjectType]:
        db_object = self.get_object(object_id)
        if not db_object:
            return None
        
        update_data = object_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_object, field, value)
        
        db_object.revision += 1
        db_object.modified_date = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(db_object)
        return db_object

    def delete_object(self, object_id: uuid.UUID) -> bool:
        db_object = self.get_object(object_id)
        if not db_object:
            return False
        
        self.db.delete(db_object)
        self.db.commit()
        return True

    # Relation methods
    def get_relations(self) -> List[Relation]:
        return self.db.query(Relation).all()

    def get_object_relations(self, object_id: uuid.UUID) -> List[Relation]:
        return self.db.query(Relation).filter(
            (Relation.primary_object_id == object_id)
        ).all()

    def create_relation(self, relation_data: RelationCreate) -> Relation:
        data = relation_data.model_dump()
        
        # Extract secondary_object_ids before creating the relation
        secondary_object_ids = data.pop('secondary_object_ids', [])
        
        # Create the relation without secondary_object_ids first
        db_relation = Relation(**data)
        self.db.add(db_relation)
        
        # Set up many-to-many relationships
        if secondary_object_ids:
            for obj_id in secondary_object_ids:
                obj = self.get_object(obj_id)
                if obj:
                    db_relation.secondary_objects.append(obj)
            
            # Also update the JSON field for backward compatibility
            db_relation.secondary_object_ids = [str(obj_id) for obj_id in secondary_object_ids]
        
        self.db.commit()
        self.db.refresh(db_relation)
        return db_relation

    def update_relation(self, relation_id: uuid.UUID, relation_data: RelationUpdate) -> Optional[Relation]:
        db_relation = self.db.query(Relation).filter(Relation.id == relation_id).first()
        if not db_relation:
            return None
        
        update_data = relation_data.model_dump(exclude_unset=True)
        
        # Handle basic fields
        for field, value in update_data.items():
            if field != 'secondary_object_ids':  # Handle this separately
                setattr(db_relation, field, value)
        
        # Handle secondary_object_ids - update many-to-many relationship
        if 'secondary_object_ids' in update_data and update_data['secondary_object_ids'] is not None:
            # Clear existing relationships
            db_relation.secondary_objects.clear()
            
            # Add new relationships
            secondary_object_ids = update_data['secondary_object_ids']
            if secondary_object_ids:
                for obj_id in secondary_object_ids:
                    obj = self.get_object(obj_id)
                    if obj:
                        db_relation.secondary_objects.append(obj)
            
            # Also update the JSON field for backward compatibility
            db_relation.secondary_object_ids = [str(obj_id) for obj_id in secondary_object_ids]
        
        self.db.commit()
        self.db.refresh(db_relation)
        return db_relation

    def delete_relation(self, relation_id: uuid.UUID) -> bool:
        db_relation = self.db.query(Relation).filter(Relation.id == relation_id).first()
        if not db_relation:
            return False
        
        self.db.delete(db_relation)
        self.db.commit()
        return True

    # Hierarchy methods
    def get_hierarchies(self) -> List[Hierarchy]:
        return self.db.query(Hierarchy).all()

    def get_object_hierarchy(self, object_id: uuid.UUID) -> List[Hierarchy]:
        return self.db.query(Hierarchy).filter(
            (Hierarchy.parent_object_id == object_id)
        ).all()

    def create_hierarchy(self, hierarchy_data: HierarchyCreate) -> Hierarchy:
        data = hierarchy_data.model_dump()

        # convert UUIDs inside secondary_object_ids to strings if JSON column
        if "child_object_ids" in data and isinstance(data["child_object_ids"], list):
            data["child_object_ids"] = [str(u) for u in data["child_object_ids"]]

        db_hierarchy = Hierarchy(**data)
        self.db.add(db_hierarchy)
        self.db.commit()
        self.db.refresh(db_hierarchy)
        return db_hierarchy

    def update_hierarchy(self, hierarchy_id: uuid.UUID, hierarchy_data: HierarchyUpdate) -> Optional[Hierarchy]:
        db_hierarchy = self.db.query(Hierarchy).filter(Hierarchy.id == hierarchy_id).first()
        if not db_hierarchy:
            return None
        
        update_data = hierarchy_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_hierarchy, field, value)
        
        self.db.commit()
        self.db.refresh(db_hierarchy)
        return db_hierarchy

    def delete_hierarchy(self, hierarchy_id: uuid.UUID) -> bool:
        db_hierarchy = self.db.query(Hierarchy).filter(Hierarchy.id == hierarchy_id).first()
        if not db_hierarchy:
            return False
        
        self.db.delete(db_hierarchy)
        self.db.commit()
        return True

    # Chat methods
    def get_chat_session(self, session_id: uuid.UUID) -> Optional[ChatSession]:
        return self.db.query(ChatSession).filter(ChatSession.id == session_id).first()

    def create_chat_session(self, session_data: ChatSessionCreate) -> ChatSession:
        db_session = ChatSession(**session_data.model_dump())
        self.db.add(db_session)
        self.db.commit()
        self.db.refresh(db_session)
        return db_session

    def update_chat_session(self, session_id: uuid.UUID, session_data: ChatSessionCreate) -> Optional[ChatSession]:
        db_session = self.get_chat_session(session_id)
        if not db_session:
            return None
        
        update_data = session_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_session, field, value)
        
        self.db.commit()
        self.db.refresh(db_session)
        return db_session

    # User methods
    def get_user(self, user_id: uuid.UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def create_user(self, user_data: dict) -> User:
        db_user = User(**user_data)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
