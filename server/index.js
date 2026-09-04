import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/api/index.js';
import { errorHandler } from './middleware/errorHandler.js';

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

const server = app.listen(PORT, () => {
  console.log(`✨ Elegant Moments API (Milestone 2.1) running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`✨ Elegant Moments API is already running on http://localhost:${PORT} (active instance attached).`);
    process.exit(0);
  } else {
    console.error('Server error:', err);
  }
});

export default app;
