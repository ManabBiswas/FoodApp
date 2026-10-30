import { isObjectId } from '../utils/validation.js';

/**
 * Reject malformed ObjectIds before they reach Mongoose, so invalid IDs return
 * 400 instead of surfacing as a 500.
 */
export const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const paramName of paramNames) {
    if (!isObjectId(req.params[paramName])) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid ${paramName}`,
      });
    }
  }

  next();
};

export default validateObjectId;
