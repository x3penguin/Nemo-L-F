FROM python:3.10

WORKDIR /usr/src/app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python files
COPY consumer.py .
COPY image_matcher.py .
COPY firebase_client.py .
COPY main.py .

# Copy Firebase credentials (will be overridden by volume mount)
COPY esd-nemo-firebase-adminsdk-fbsvc-fbe963cc58.json .

EXPOSE 3002
# Run the service - environment variables will be passed at runtime
CMD ["python", "./main.py"]