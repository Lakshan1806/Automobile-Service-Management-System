#!/usr/bin/env sh
set -e

# Optional (will no-op if static not configured)
python manage.py collectstatic --noinput || true
python manage.py migrate --noinput

# Default: keep same dev behavior
if [ "$MODE" = "prod" ]; then
  # If you want prod later, add gunicorn to requirements and use it here
  exec gunicorn root.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3} --timeout ${GUNICORN_TIMEOUT:-60}
else
  exec python manage.py runserver 0.0.0.0:8000
fi
