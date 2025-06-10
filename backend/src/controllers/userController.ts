import { Router, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
const userService = new UserService();

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  jobField: z.string().optional(),
  location: z.string().optional(),
  emailNotifications: z.boolean().optional(),
});

// GET /api/users/profile
router.get('/profile', async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await userService.findById(req.user!.id);
    if (!user) {
      throw createError('User not found', 404);
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile
router.put('/profile', async (req: AuthRequest, res: Response, next) => {
  try {
    const updates = updateProfileSchema.parse(req.body);
    const user = await userService.update(req.user!.id, updates);
    if (!user) {
      throw createError('User not found', 404);
    }
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
});

export default router; 