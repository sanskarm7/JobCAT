import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Tracker API',
      version: '1.0.0',
      description: 'API documentation for the Job Tracker application',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options); 