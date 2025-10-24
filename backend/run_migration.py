#!/usr/bin/env python3
"""
Create and run database migration.
"""

import subprocess
import sys


def run_migration():
    """Create and run the database migration."""

    print("🗄️  Creating database migration...")

    try:
        # Create migration
        result = subprocess.run([
            sys.executable, '-m', 'alembic', 'revision', '--autogenerate',
            '-m', 'Add PDF document and extracted data tables'
        ], capture_output=True, text=True, cwd='/workspace/backend')

        if result.returncode != 0:
            print("❌ Error creating migration:")
            print(result.stderr)
            return False

        print("✅ Migration created successfully!")

        # Run migration
        print("🚀 Running migration...")
        result = subprocess.run([
            sys.executable, '-m', 'alembic', 'upgrade', 'head'
        ], capture_output=True, text=True, cwd='/workspace/backend')

        if result.returncode != 0:
            print("❌ Error running migration:")
            print(result.stderr)
            return False

        print("✅ Migration completed successfully!")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    if run_migration():
        print("\n🎉 Database is ready!")
        print("Next steps:")
        print("1. Start the server: uvicorn app.main:app --reload")
        print("2. Visit: http://localhost:8000/docs")
        print("3. Test PDF upload endpoints")
    else:
        print("\n❌ Migration failed. Check the errors above.")
