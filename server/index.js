import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/api/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import { initDb } from './db/index.js';

const app = express();
const PORT = config.port;

// Middlewares
app.use(cors({
  origin: config.env === 'production' ? config.clientUrl : true,
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Central Error Handler
app.use(errorHandler);

let server;
if (process.env.NODE_ENV !== 'test') {
  initDb().catch((err) => console.warn('DB Init error:', err.message));
  server = app.listen(PORT, () => {
    console.log(`✨ Elegant Moments API (Milestone 2.1) running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`✨ Elegant Moments API is already running on http://localhost:${PORT} (active instance attached).`);
    } else {
      console.error('Server error:', err);
    }
  });
}

export default app;
