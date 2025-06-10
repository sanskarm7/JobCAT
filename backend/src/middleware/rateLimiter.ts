import rateLimit from 'express-rate-limit';
import { createError } from './errorHandler';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    throw createError('Too many requests, please try again later.', 429);
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login/register requests per hour
  handler: (req, res) => {
    throw createError('Too many authentication attempts, please try again later.', 429);
  },
}); 