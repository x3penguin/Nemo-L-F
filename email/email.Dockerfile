# Use Node.js as the base image
FROM node:22-slim

# Create app directory and set proper permissions
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Start the application
CMD ["node", "./src/index.js"]