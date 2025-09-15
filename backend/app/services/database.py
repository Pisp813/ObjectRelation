from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.models import ObjectType, Relation, Hierarchy, User, Types, RelationType, HierarchyType
from app.schemas.schemas import (
    ObjectCreate, ObjectUpdate, RelationCreate, RelationUpdate,
    HierarchyCreate, HierarchyUpdate, ChatSessionCreate, TypesCreate, TypesUpdate,
    RelationTypeBase, RelationTypeCreate, RelationTypeBase, RelationTypeUpdate,
    HierarchyTypeBase, HierarchyTypeCreate, HierarchyTypeUpdate
)
import uuid
from datetime import datetime


class DatabaseService:
    def __init__(self, db: Session):
        self.db = db

    # ObjectType methods
    def get_object_types(self) -> Optional[Types]:
        return self.db.query(Types).all()
    
    def get_object_type(self, object_type_id: uuid.UUID) -> Optional[Types]:
        return self.db.query(Types).filter(Types.id == object_type_id).first()
    
    def create_object_type(self, object_type_data: TypesCreate) -> Types:
        db_object_type = Types(**object_type_data.model_dump())
        self.db.add(db_object_type)
        self.db.commit()
        self.db.refresh(db_object_type)
        return db_object_type
    
    def update_object_type(self, object_type_id: uuid.UUID, object_type_data: TypesUpdate) -> Optional[Types]:
        db_object_type = self.get_object_type(object_type_id)
        if not db_object_type:
            return None
        
        update_data = object_type_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_object_type, field, value)
        
        # db_object_type.revision += 1
        # db_object_type.modified_date = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(db_object_type)
        return db_object_type
    
    def get_object_type_by_name(self, type_name: str) -> Optional[Types]:
        return self.db.query(Types).filter(Types.object_type == type_name).first().id
    
    def delete_object_type(self, object_type_id: uuid.UUID) -> bool:
        db_object_type = self.get_object_type(object_type_id)
        if not db_object_type:
            return False
        
        self.db.delete(db_object_type)
        self.db.commit()
        return True

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
    
    # RelationType methods
    def get_relation_types(self) -> Optional[RelationType]:
        return self.db.query(RelationType).all()
    
    def get_relation_type(self, relation_type_id: int) -> Optional[RelationType]:
        return self.db.query(RelationType).filter(RelationType.id == relation_type_id).first()
    
    def create_relation_type(self, relation_type_data: RelationTypeCreate) -> RelationType:
        db_relation_type = RelationType(**relation_type_data.model_dump())
        self.db.add(db_relation_type)
        self.db.commit()
        self.db.refresh(db_relation_type)
        return db_relation_type
    
    def update_relation_type(self, relation_type_id: int, relation_type_data: RelationTypeUpdate) -> Optional[RelationType]:
        db_relation_type = self.get_relation_type(relation_type_id)
        if not db_relation_type:
            return None

        update_data = relation_type_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_relation_type, key, value)

        self.db.commit()
        self.db.refresh(db_relation_type)
        return db_relation_type
    
    def delete_relation_type(self, relation_type_id: int):
        db_relation_type = self.get_relation_type(relation_type_id)
        if not db_relation_type:
            return None

        self.db.delete(db_relation_type)
        self.db.commit()
        return db_relation_type

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
    
    # HerearchyType methods

    def get_hierarchy_types(self) -> List[HierarchyType]:
        return self.db.query(HierarchyType).all()
    
    def get_hierarchy_type_by_object(self, object_id: int) -> Optional[HierarchyType]:
        return self.db.query(HierarchyType).filter(HierarchyType.object_type == object_id).first()
    
    def create_hierarchy_type(self, hierarchy_data: HierarchyTypeCreate) -> HierarchyType:
        db_hierarchy = HierarchyType(**hierarchy_data.dict())
        self.db.add(db_hierarchy)
        self.db.commit()
        self.db.refresh(db_hierarchy)
        return db_hierarchy

    # def get_hierarchy_type(self, hierarchy_id: int):
    #     return self.db.query(HierarchyType).filter(HierarchyType.id == hierarchy_id).first()

    def update_hierarchy_type(self, hierarchy_id: int, hierarchy_data: HierarchyTypeUpdate):
        db_hierarchy = self.get_hierarchy_type_by_object(hierarchy_id)
        if not db_hierarchy:
            return None

        update_data = hierarchy_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_hierarchy, key, value)

        self.db.commit()
        self.db.refresh(db_hierarchy)
        return db_hierarchy


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
