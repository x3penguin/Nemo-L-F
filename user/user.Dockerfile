# Use Node.js as the base image
FROM node:16-alpine

# Create app directory and set proper permissions
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the port your service runs on
EXPOSE 3004

# Command to run the application
CMD ["node", "index.js"]
