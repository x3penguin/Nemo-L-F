const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Email API',
    description: 'API documentation',
    version: '1.0.0'
  },
  host: 'localhost:8000/email', // Update based on Kong routing
  schemes: ['http']
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.js']; // Your main file with routes

swaggerAutogen(outputFile, endpointsFiles, doc);
