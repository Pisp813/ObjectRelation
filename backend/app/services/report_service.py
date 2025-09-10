from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from typing import List
from app.models.models import ObjectType, Relation, Hierarchy
from io import BytesIO
import datetime


class ReportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
        )
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=18,
            spaceAfter=20,
        )
        self.normal_style = self.styles['Normal']

    def generate_objects_report(self, objects: List[ObjectType]) -> BytesIO:
        """Generate PDF report for objects"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, margins=[50, 50, 50, 50])
        story = []

        # Title
        story.append(Paragraph("Object Design System - Objects Report", self.title_style))
        story.append(Paragraph(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.normal_style))
        story.append(Spacer(1, 30))

        if not objects:
            story.append(Paragraph("No objects found.", self.normal_style))
        else:
            for i, obj in enumerate(objects, 1):
                story.append(Paragraph(f"{i}. {obj.name}", self.heading_style))
                story.append(Paragraph(f"Type: {obj.type}", self.normal_style))
                if obj.description:
                    story.append(Paragraph(f"Description: {obj.description}", self.normal_style))
                if obj.attributes:
                    story.append(Paragraph(f"Attributes: {obj.attributes}", self.normal_style))
                if obj.tables:
                    story.append(Paragraph("Tables:", self.normal_style))
                    for table in obj.tables:
                        story.append(Paragraph(f"  • {table['name']}", self.normal_style))
                story.append(Spacer(1, 20))

        doc.build(story)
        buffer.seek(0)
        return buffer

    def generate_relations_report(self, relations: List[Relation], objects: List[ObjectType]) -> BytesIO:
        """Generate PDF report for relations"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, margins=[50, 50, 50, 50])
        story = []

        # Title
        story.append(Paragraph("Object Design System - Relations Report", self.title_style))
        story.append(Paragraph(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.normal_style))
        story.append(Spacer(1, 30))

        if not relations:
            story.append(Paragraph("No relations found.", self.normal_style))
        else:
            for i, relation in enumerate(relations, 1):
                # Find primary object name
                primary_obj = next((obj for obj in objects if obj.id == relation.primary_object_id), None)
                primary_name = primary_obj.name if primary_obj else "Unknown"
                
                story.append(Paragraph(f"{i}. {primary_name} → {relation.relation_type.replace('_', ' ')}", self.heading_style))
                
                if relation.secondary_object_ids:
                    story.append(Paragraph("Related Objects:", self.normal_style))
                    for obj_id in relation.secondary_object_ids:
                        related_obj = next((obj for obj in objects if obj.id == obj_id), None)
                        related_name = related_obj.name if related_obj else "Unknown"
                        related_type = related_obj.type if related_obj else "Unknown"
                        story.append(Paragraph(f"  • {related_name} ({related_type})", self.normal_style))
                
                if relation.description:
                    story.append(Paragraph(f"Description: {relation.description}", self.normal_style))
                story.append(Spacer(1, 20))

        doc.build(story)
        buffer.seek(0)
        return buffer

    def generate_hierarchies_report(self, hierarchies: List[Hierarchy], objects: List[ObjectType]) -> BytesIO:
        """Generate PDF report for hierarchies"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, margins=[50, 50, 50, 50])
        story = []

        # Title
        story.append(Paragraph("Object Design System - Hierarchies Report", self.title_style))
        story.append(Paragraph(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.normal_style))
        story.append(Spacer(1, 30))

        if not hierarchies:
            story.append(Paragraph("No hierarchies found.", self.normal_style))
        else:
            # Group hierarchies by parent
            parent_groups = {}
            for hierarchy in hierarchies:
                parent_id = str(hierarchy.parent_object_id) if hierarchy.parent_object_id else "root"
                if parent_id not in parent_groups:
                    parent_groups[parent_id] = []
                parent_groups[parent_id].append(hierarchy)

            for parent_id, hierarchy_list in parent_groups.items():
                if parent_id == "root":
                    parent_name = "Root Level"
                else:
                    parent_obj = next((obj for obj in objects if str(obj.id) == parent_id), None)
                    parent_name = parent_obj.name if parent_obj else "Unknown"
                
                story.append(Paragraph(f"Parent: {parent_name}", self.heading_style))
                
                for hierarchy in hierarchy_list:
                    if hierarchy.child_object_ids:
                        story.append(Paragraph(f"Level {hierarchy.level or 1} Children:", self.normal_style))
                        for child_id in hierarchy.child_object_ids:
                            child_obj = next((obj for obj in objects if str(obj.id) == child_id), None)
                            child_name = child_obj.name if child_obj else "Unknown"
                            child_type = child_obj.type if child_obj else "Unknown"
                            story.append(Paragraph(f"  • {child_name} ({child_type})", self.normal_style))
                story.append(Spacer(1, 20))

        doc.build(story)
        buffer.seek(0)
        return buffer

    def generate_full_report(self, objects: List[ObjectType], relations: List[Relation], hierarchies: List[Hierarchy]) -> BytesIO:
        """Generate comprehensive PDF report"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, margins=[50, 50, 50, 50])
        story = []

        # Title
        story.append(Paragraph("Object Design System - Complete Report", self.title_style))
        story.append(Paragraph(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.normal_style))
        story.append(Spacer(1, 30))

        # Objects section
        story.append(Paragraph("OBJECTS", self.heading_style))
        if objects:
            for i, obj in enumerate(objects, 1):
                story.append(Paragraph(f"{i}. {obj.name} ({obj.type})", self.styles['Heading3']))
                if obj.description:
                    story.append(Paragraph(f"Description: {obj.description}", self.normal_style))
                story.append(Spacer(1, 10))
        else:
            story.append(Paragraph("No objects found.", self.normal_style))
        
        story.append(Spacer(1, 30))

        # Relations section
        story.append(Paragraph("RELATIONS", self.heading_style))
        if relations:
            for i, relation in enumerate(relations, 1):
                primary_obj = next((obj for obj in objects if obj.id == relation.primary_object_id), None)
                primary_name = primary_obj.name if primary_obj else "Unknown"
                story.append(Paragraph(f"{i}. {primary_name} → {relation.relation_type.replace('_', ' ')}", self.styles['Heading3']))
                if relation.description:
                    story.append(Paragraph(f"Description: {relation.description}", self.normal_style))
                story.append(Spacer(1, 10))
        else:
            story.append(Paragraph("No relations found.", self.normal_style))
        
        story.append(Spacer(1, 30))

        # Hierarchies section
        story.append(Paragraph("HIERARCHIES", self.heading_style))
        if hierarchies:
            parent_groups = {}
            for hierarchy in hierarchies:
                parent_id = str(hierarchy.parent_object_id) if hierarchy.parent_object_id else "root"
                if parent_id not in parent_groups:
                    parent_groups[parent_id] = []
                parent_groups[parent_id].append(hierarchy)

            for parent_id, hierarchy_list in parent_groups.items():
                if parent_id == "root":
                    parent_name = "Root Level"
                else:
                    parent_obj = next((obj for obj in objects if str(obj.id) == parent_id), None)
                    parent_name = parent_obj.name if parent_obj else "Unknown"
                
                story.append(Paragraph(f"Parent: {parent_name}", self.styles['Heading3']))
                for hierarchy in hierarchy_list:
                    if hierarchy.child_object_ids:
                        for child_id in hierarchy.child_object_ids:
                            child_obj = next((obj for obj in objects if str(obj.id) == child_id), None)
                            child_name = child_obj.name if child_obj else "Unknown"
                            story.append(Paragraph(f"  • {child_name}", self.normal_style))
                story.append(Spacer(1, 10))
        else:
            story.append(Paragraph("No hierarchies found.", self.normal_style))

        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph("Generated by Object Design System", self.normal_style))

        doc.build(story)
        buffer.seek(0)
        return buffer
