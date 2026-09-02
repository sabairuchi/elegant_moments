// Centralized Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  console.error(`[SERVER ERROR] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
