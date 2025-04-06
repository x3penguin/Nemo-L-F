# Nemo-L-F

## Description
NEMO is a City-Wide Lost & Found Platform that helps people locate missing items or return found ones. The system leverages microservices architecture to facilitate user reporting, matching, and retrieval of lost items.

Key features of the platform include:

- **Lost and Found Reporting**: Users can easily report both lost and found items with descriptions, images, and location data.

- **Image and Location Matching**: The system intelligently compares new found item reports with existing lost item reports using image recognition and geolocation to suggest potential matches.

- **In-App Chat**: Users can communicate directly with those who reported matching items to verify ownership and coordinate recovery.

- **Courier Delivery Option**: Users can arrange for the return of lost items via courier, offering a convenient and contactless handover method.

- **Email Notifications**: Users receive timely email updates regarding the status of their reported items, including successful matches or delivery confirmations.

## Architecture
NEMO uses a microservice architecture with the following services:
- Frontend (Vue.js)
- User Service
- Storage Service
- Match Service
- Location Service
- Email Service
- Logistics Service

## Prerequisites
- Docker 27.5.1
- Python 3.7 or later
- Node.js 20 or later
- .env files (ask from contributors)
- Firebase Admin SDK JSON file (ask from contributors)
- Ensure that ports to be used are not currently used by other programs

## Project Setup Instructions

### Running with Docker
1. Check if any docker images are already running:
   ```
   docker ps
   ```

2. Stop any running docker images if needed:
   ```
   docker stop <container_id>
   ```

3. Build & Run all docker images at once: 
   ```
   docker-compose up -d --build
   ```

4. If changes were made to any of the microservices files:
   ```
   docker-compose down <container_id(s)> && docker-compose up --build <container_id(s)> -d
   ```

## Accessing the Application
Once the application is running, access it at:
- Frontend: http://localhost:8080

## Accessing the HTTP-based API Documentation
Once the application is running, access it at:
- Email: http://localhost:8000/email/api-docs
- Location: http://localhost:8000/location/swagger.json
- Logistics: http://localhost:8000/logistics/swagger.json
- Storage: http://localhost:8000/storage/api-docs
- User: http://localhost:8000/user/api-docs
Alternatively, access it in the Nemo_api_documentation.zip

## Accessing the Kafka-based API Documentation
- Email: Nemo_api_documentation.zip
- Match: Nemo_api_documentation.zip

## Contributors
- Chow Ean Ean
- Dorothy Chan
- Lim Zhi Yang
- Ryan Hung
- Tan lee Xin