/**
 * Maps known database errors to client-safe responses. Unknown errors are
 * logged and hidden from the client outside development.
 */
const handleControllerError = (res, error) => {
  if (error?.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: `Invalid value for ${error.path || 'identifier'}`,
    });
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];
    return res.status(409).json({
      status: 'error',
      message: field ? `${field} is already in use` : 'Duplicate value entered',
    });
  }

  if (error?.name === 'ValidationError') {
    const message = Object.values(error.errors || {})
      .map((item) => item.message)
      .join(', ');

    return res.status(400).json({
      status: 'error',
      message: message || 'Validation failed',
    });
  }

  console.error(error);

  const message =
    process.env.NODE_ENV === 'development'
      ? error?.message || 'Server Error'
      : 'Server Error';

  return res.status(500).json({
    status: 'error',
    message,
  });
};

export default handleControllerError;
