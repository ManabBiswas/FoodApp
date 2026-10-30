import { rateLimit } from 'express-rate-limit';

// Failed authentication attempts are limited more aggressively. Successful
// requests do not count, so normal usage is unaffected.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes   
  limit: 20,  // limit each IP to 20 requests per windowMs                
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
  },
});

export default authLimiter;
