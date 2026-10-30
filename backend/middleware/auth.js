import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const unauthorized = (res, message = 'Not authorized to access this route') =>
  res.status(401).json({
    status: 'error',
    message,
  });

export const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return unauthorized(res);
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      return unauthorized(res);
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return unauthorized(res, 'Not authorized, token failed');
    }

    if (!decoded?.id) {
      return unauthorized(res, 'Not authorized, token failed');
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return unauthorized(res, 'User not found');
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deactivated',
      });
    }

    return next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server Error',
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access this route',
      });
    }

    return next();
  };
};
