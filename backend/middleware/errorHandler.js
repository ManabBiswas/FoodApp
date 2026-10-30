const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload',
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = { message: `Invalid value for ${err.path || 'identifier'}`, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = {
      message: field ? `${field} is already in use` : 'Duplicate field value entered',
      statusCode: 409,
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = {
      message: Object.values(err.errors || {})
        .map((val) => val.message)
        .join(', '),
      statusCode: 400,
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = { message: 'Not authorized, token failed', statusCode: 401 };
  }

  const message =
    error.statusCode && error.statusCode < 500
      ? error.message
      : process.env.NODE_ENV === 'development'
        ? error.message || 'Server Error'
        : 'Server Error';

  res.status(error.statusCode || 500).json({
    status: 'error',
    message,
  });
};

export default errorHandler;
