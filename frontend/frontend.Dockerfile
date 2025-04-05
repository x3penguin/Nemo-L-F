# Build stage
FROM node:22-slim AS build-stage

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files and build the app
COPY . .
RUN npm run build

ENV NODE_ENV=development

# Expose port 8080
EXPOSE 8080

CMD ["npm", "run", "serve", "--", "--host", "0.0.0.0"]
