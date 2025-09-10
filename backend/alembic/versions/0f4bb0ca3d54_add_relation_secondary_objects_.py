"""Add relation secondary objects association table

Revision ID: 0f4bb0ca3d54
Revises: 1f1ba416f2eb
Create Date: 2025-09-10 07:14:01.722464

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0f4bb0ca3d54'
down_revision: Union[str, None] = '1f1ba416f2eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the association table for many-to-many relationship
    op.create_table(
        'relation_secondary_objects',
        sa.Column('relation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('relations.id'), primary_key=True, nullable=False),
        sa.Column('object_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('objects.id'), primary_key=True, nullable=False)
    )


def downgrade() -> None:
    # Drop the association table
    op.drop_table('relation_secondary_objects')
