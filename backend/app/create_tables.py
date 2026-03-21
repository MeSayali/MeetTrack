from backend.app.database import Base, engine

# IMPORT ALL MODELS HERE (VERY IMPORTANT)
from backend.models.user import User
from backend.models.meeting import Meeting
from backend.models.action_item import ActionItem

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")