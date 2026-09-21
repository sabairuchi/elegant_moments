// Centralized Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  console.error(`[SERVER ERROR] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  
  // In production, sanitize 500 errors to hide internal implementation/DB details
  const message = (process.env.NODE_ENV === 'production' && statusCode === 500)
    ? 'An unexpected internal server error occurred.'
    : (err.message || 'An unexpected error occurred.');

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
