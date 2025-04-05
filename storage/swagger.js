import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Storage API',
    description: 'API documentation',
    version: '1.0.0'
  },
  host: 'localhost:8000/storage', // Update based on Kong routing
  schemes: ['http']
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js']; // Path to your main file with routes

// Initialize Swagger Autogen
const swagger = swaggerAutogen();

// Generate the OpenAPI spec
swagger(outputFile, endpointsFiles, doc).then(() => {
  console.log('OpenAPI spec generated successfully!');
});