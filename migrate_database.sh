#!/bin/bash

# Database Migration Script
# Run this script whenever you change the DATABASE_URL to set up all required tables.
#
# Usage:
#   ./migrate_database.sh
#   or
#   bash migrate_database.sh

set -e  # Exit on error

echo "============================================================"
echo "🔄 Database Migration Script"
echo "============================================================"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env not found"
    echo "Please create backend/.env with DATABASE_URL"
    exit 1
fi

# Load DATABASE_URL from backend/.env
export $(grep -v '^#' backend/.env | grep DATABASE_URL | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in backend/.env"
    exit 1
fi

echo ""
echo "📂 Using environment from: backend/.env"
echo "🔗 Database URL configured"

# Check if Python is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Error: Python not found. Please install Python 3."
    exit 1
fi

# Check if backend venv exists
if [ -f "backend/.venv/bin/python" ]; then
    PYTHON_CMD="backend/.venv/bin/python"
    echo "✓ Using backend virtual environment"
fi

echo ""
echo "============================================================"
echo "Running migration with Python..."
echo "============================================================"

# Run the Python migration script
$PYTHON_CMD migrate_database.py

echo ""
echo "✅ Migration script completed!"
