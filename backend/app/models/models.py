from sqlalchemy import Column, String, Text, JSON, TIMESTAMP, Integer, ForeignKey, func, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, backref
from app.db.base import Base
import uuid
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


# Association table for many-to-many relationship between relations and secondary objects
relation_secondary_objects = Table(
    'relation_secondary_objects',
    Base.metadata,
    Column('relation_id', UUID(as_uuid=True), ForeignKey('relations.id'), primary_key=True),
    Column('object_id', UUID(as_uuid=True), ForeignKey('objects.id'), primary_key=True)
)

class Types(Base):
    __tablename__ = "object_types"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    object_type = Column(String, unique=True, nullable=False)  
    parid = Column(Integer, nullable=False)
    attributes = Column(JSON, default={})
    tables = Column(JSON, default=[])
    description = Column(Text, nullable=False)

class ObjectType(Base):
    __tablename__ = "objects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # 'Item' | 'Document'
    attributes = Column(JSON, default={})
    tables = Column(JSON, default=[])
    created_date = Column(TIMESTAMP, server_default=func.now())
    modified_date = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    revision = Column(Integer, default=1)
    
    # Relationships
    primary_relations = relationship("Relation", 
                                   foreign_keys="Relation.primary_object_id",
                                   back_populates="primary_object")
    secondary_relations = relationship("Relation", 
                                     secondary=relation_secondary_objects,
                                     back_populates="secondary_objects")

class RelationType(Base):
    __tablename__ = "relation_types"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    primary_type = Column(Integer, nullable=False)  # e.g., 'Item' | 'Document'
    secondary_type = Column(Integer, nullable=False)  # e.g., 'Item' |

class Relation(Base):
    __tablename__ = "relations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    primary_object_id = Column(UUID(as_uuid=True), ForeignKey("objects.id"), nullable=False)
    relation_type = Column(String, nullable=False)
    description = Column(Text)
    
    # Keep the JSON field for backward compatibility but don't use it for relationships
    secondary_object_ids = Column(JSON, default=[])
    
    # Relationships
    primary_object = relationship("ObjectType", 
                                foreign_keys=[primary_object_id],
                                back_populates="primary_relations")
    secondary_objects = relationship("ObjectType", 
                                   secondary=relation_secondary_objects,
                                   back_populates="secondary_relations")


class HierarchyType(Base):
    __tablename__ = "hierarchy_type"

    id = Column(Integer, primary_key=True, autoincrement=True)
    object_type = Column(Integer, nullable=True)
    inventory = Column(JSON, nullable=True)
    purchase = Column(JSON, nullable=True)

    

class Hierarchy(Base):
    __tablename__ = "hierarchies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_object_id = Column(UUID(as_uuid=True))
    child_object_ids = Column(JSON, default=[])
    level = Column(Integer, default=0)
    properties = Column(JSON, default={})
