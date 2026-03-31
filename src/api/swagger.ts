import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Job Applier API',
      version: '1.0.0',
      description: 'API for AI Job Applier platform',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
  apis: ['./src/api/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
