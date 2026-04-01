import fs from 'fs';
import path from 'path';
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

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerSpec = swaggerJsdoc(options);
const outputPath = path.resolve(__dirname, '../frontend/openapi.json');

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`OpenAPI spec generated at ${outputPath}`);
