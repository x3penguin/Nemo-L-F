# Nemo Lost & Found - Frontend

This folder contains the frontend application for Nemo Lost & Found, a platform that connects people who have lost items with those who have found them.

## Features

- User authentication (login/register)
- Report lost and found items
- Smart item matching system
- In-app chat for communication between users
- Logistics integration for item delivery
- User profile management
- Map-based location tracking for items

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Maps API key
- Firebase project

## Environment Setup

Create a `.env` file in the root of the frontend directory following the variables listed within **.env.example**

## Installation

```bash
# Install dependencies
npm install

# Serve with hot reload at localhost:8080
npm run serve

# Build for production
npm run build
```

## Project Structure

```
frontend/
├── public/                # Static files
├── src/
│   ├── assets/            # Images, styles, etc.
│   ├── components/        # Reusable Vue components
│   ├── firebase.js        # Firebase configuration
│   ├── router/            # Vue Router configuration
│   ├── services/          # API service classes
│   ├── store/             # Vuex store modules
│   ├── views/             # Page components
│   ├── App.vue            # Root component
│   └── main.js            # Application entry point
├── .env                   # Environment variables
└── package.json           # Project dependencies
```

## Key Components

- **Home.vue**: Landing page with platform introduction
- **Login/Register.vue**: Authentication forms
- **ReportLost/ReportFound.vue**: Item reporting forms with map integration
- **Collection.vue**: View for managing matched items
- **PotentialMatches.vue**: View showing potential matches for lost items
- **Chat.vue**: In-app messaging system
- **Profile.vue**: User profile management
- **ItemCard.vue**: Reusable item display component
- **ItemCarousel.vue**: Component for browsing potential matches

## Integrations

- **Firebase**: Authentication, Firestore database, and Storage
- **Google Maps**: Location selection and visualization
- **Stripe**: Payment processing for logistics services
- **Kafka**: Message queue for notifications and matching service communication

## API Services

The frontend communicates with several backend microservices:

- **Storage Service**: Item data management
- **User Service**: User authentication and management
- **Location Service**: Geocoding and location services
- **Logistics Service**: Delivery arrangements
- **Email Service**: Notification emails
- **Match Service**: Smart matching algorithm

## Deployment

For production deployment, build the application with:

```bash
npm run build

## Docker Support

The frontend can be built and served using Docker:

```bash
# Build the Docker image
docker build -t nemo/frontend:1.0 -f frontend.Dockerfile .

# Run the container
docker run -p 8080:8080 nemo/frontend:1.0
```