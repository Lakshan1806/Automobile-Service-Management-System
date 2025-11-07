#!/bin/bash
# Wait for database to be ready
echo "Waiting for MySQL to be ready..."
sleep 10

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create test data
echo "Creating test data..."
python create_test_data.py

# Start the server
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000
