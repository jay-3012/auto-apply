import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from '#config/env.js';
import { sequelize } from '#db/index.js';
import { setupCronJobs } from '#queues/index.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';

// Routers
import { healthRouter } from './api/routes/health.routes.js';
import { authRouter } from './api/routes/auth.routes.js';
import { jobsRouter } from './api/routes/jobs.routes.js';
import { applicationsRouter } from './api/routes/applications.routes.js';
import { resumesRouter } from './api/routes/resumes.routes.js';
import { rolesRouter } from './api/routes/roles.routes.js';
import { adminRouter } from './api/routes/admin.routes.js';

import { swaggerSpec } from './api/swagger.js';

const app = express();

app.use(express.json());
app.use(requestLogger);

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Admin routes
app.use(adminRouter); // mounted at /admin/queues inside the router

// API Routes
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/roles', rolesRouter);

// Global Error Handler
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    // Only attempt to connect if db url is not a stub localhost if it cannot reach
    // In dev it'll crash here if DB is not running, which is expected.
    await sequelize.authenticate();
    console.log('Database connected.');

    // In dev, sync models (in production we would use migrations)
    await sequelize.sync({ alter: true });

    await setupCronJobs();
    console.log('Cron jobs scheduled.');

    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
      console.log(`Swagger docs at http://localhost:${env.PORT}/api/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
