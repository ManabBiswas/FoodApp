import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';

// Import routes
import addressRoutes from './routes/address.routes.js';
import authRoutes from './routes/auth.routes.js';
import cartRoutes from './routes/cart.routes.js';
import foodRoutes from './routes/food.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Fail fast when required configuration is missing.
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const jwtSecretIsPlaceholder = /change|placeholder|your_/i.test(
  process.env.JWT_SECRET
);

if (jwtSecretIsPlaceholder) {
  if (isProduction) {
    console.error('JWT_SECRET still contains the example placeholder. Set a strong secret before deploying.');
    process.exit(1);
  }

  console.warn('JWT_SECRET is using the example placeholder. Change it before deploying.');
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('JWT_SECRET is shorter than 32 characters. Use a longer random secret.');
}

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const devOrigins = [
  'http://localhost:8081',
  'http://localhost:8082',
  'http://10.0.2.2:8081',
  'http://10.0.2.2:8082',
];

const configuredOrigins = parseOrigins(process.env.FRONTEND_URL);
const allowedOrigins = [...new Set([...devOrigins, ...configuredOrigins])];

// Web development can run on any Metro port, not just 8081/8082.
const isLocalDevOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '[::1]')
    );
  } catch {
    return false;
  }
};

const devCorsOrigin = (origin, callback) => {
  // Native apps and curl do not send an Origin header.
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
    return callback(null, true);
  }
  return callback(null, false);
};

if (isProduction && configuredOrigins.length === 0) {
  console.error('FRONTEND_URL must be set in production so CORS can allow the web client.');
  process.exit(1);
}

const app = express();

// Behind a reverse proxy (Render, Fly, nginx) the client IP lives in
// X-Forwarded-For. Trust exactly one proxy hop so rate limiting uses it.
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: isProduction ? configuredOrigins : devCorsOrigin,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (!isProduction) {
  app.use(morgan('dev'));
}

// General rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received, shutting down`);
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

export { startServer };
export default app;
