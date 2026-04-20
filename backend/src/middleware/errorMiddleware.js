/**
 * @desc    Global Error Handler Middleware
 */
const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error("❌ ERROR STACK:", err.stack);

  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error'
    });
  }

  // Final response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorMiddleware;
