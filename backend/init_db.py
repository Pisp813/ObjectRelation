#!/usr/bin/env python3
"""
Database initialization script for Object Design System
"""
import os
import sys
from app.db.base import engine, Base
from app.utils.seed_data import seed_database
from app.services.database import DatabaseService
from sqlalchemy.orm import Session

def init_database():
    """Initialize the database with tables and sample data"""
    print("Initializing database...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
    
    # Seed with sample data
    db = Session(bind=engine)
    try:
        db_service = DatabaseService(db)
        seed_database(db_service)
    finally:
        db.close()
    
    print("Database initialization completed!")

if __name__ == "__main__":
    init_database()
