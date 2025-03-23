# Use Python as the base image
FROM python:3.9-slim

# Set working directory
WORKDIR /usr/src/app

# Copy requirements file first (for better caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port your service runs on
EXPOSE 3003

# Command to run the application
CMD ["python", "payment.py"]
