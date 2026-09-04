import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/api/index.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Support both /api/... and direct routing in Vercel serverless environment
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use(errorHandler);

export default app;
