// A lightweight in-memory sliding window rate limiter
// Compatible with Express and Vercel Serverless

const store = new Map();

/**
 * Clean up expired records every 5 minutes to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of store.entries()) {
    if (now > data.resetTime) {
      store.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

/**
 * Rate limiting middleware factory
 * @param {Object} options 
 * @param {number} options.windowMs - Time frame in milliseconds
 * @param {number} options.max - Max number of requests per window
 * @param {string} options.message - Error message when limit exceeded
 */
export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 20, message = 'Too many requests, please try again later.' }) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!store.has(ip)) {
      store.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const data = store.get(ip);

    // If window expired, reset
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    // Increment count
    data.count++;

    // Check if over limit
    if (data.count > max) {
      res.setHeader('Retry-After', Math.ceil((data.resetTime - now) / 1000));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
};
