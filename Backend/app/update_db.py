import sys
import os

# Add current directory to path so imports work
sys.path.append(os.getcwd())

from database import drop_tables, create_tables

print("Updating database schema...")
try:
    print("Dropping tables...")
    drop_tables()
    print("Creating tables...")
    create_tables()
    print("Database schema updated successfully.")
except Exception as e:
    print(f"Error updating schema: {e}")
