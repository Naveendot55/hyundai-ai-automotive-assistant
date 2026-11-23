export const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err.stack || err.message);

  const statusCode = res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
