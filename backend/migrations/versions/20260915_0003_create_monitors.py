"""Create monitor configurations.

Revision ID: 20260915_0003
Revises: 20260914_0002
"""

from alembic import op
import sqlalchemy as sa

revision = "20260915_0003"
down_revision = "20260914_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "monitors",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.Column("interval_value", sa.Integer(), nullable=False),
        sa.Column("interval_unit", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("interval_value >= 1", name="ck_monitors_interval_positive"),
        sa.CheckConstraint("interval_unit IN ('seconds', 'minutes', 'hours')", name="ck_monitors_interval_unit"),
        sa.CheckConstraint(
            "(interval_unit = 'seconds' AND interval_value <= 31536000) OR "
            "(interval_unit = 'minutes' AND interval_value <= 525600) OR "
            "(interval_unit = 'hours' AND interval_value <= 8760)",
            name="ck_monitors_interval_max_seconds",
        ),
    )
    op.create_index("ix_monitors_user_id", "monitors", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_monitors_user_id", table_name="monitors")
    op.drop_table("monitors")
