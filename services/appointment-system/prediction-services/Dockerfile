# Use an official Python runtime as a parent image
# 'slim' is a good choice for a smaller image size
FROM python:3.11-slim
WORKDIR /app

# Speed up flaky network installs during image build
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=120

# Copy the requirements file and install dependencies
# This is also optimized. It only re-installs if requirements.txt changes.
COPY requirements.txt .
RUN pip install --no-cache-dir --progress-bar off --default-timeout=120 --retries=5 -r requirements.txt

# Copy the rest of your application code into the container
# This includes your .py files, .env, and your .joblib model file
COPY . .

# Expose the port your .env file specifies (8010)
EXPOSE 8010

# Command to run uvicorn
# This assumes your main file is 'main.py' and your FastAPI app is 'app'.
# Adjust 'main:app' if your file or app variable is named differently.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8010"]
