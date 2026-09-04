import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/api/index.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

import { config } from '../server/config/index.js';

const app = express();

// Middlewares
app.use(cors({
  origin: config.env === 'production' ? config.clientUrl : true,
  credentials: true,
}));
app.use(express.json());

// Support both /api/... and direct routing in Vercel serverless environment
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use(errorHandler);

export default app;
