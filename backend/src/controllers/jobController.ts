import { Router, Response } from 'express';
import { z } from 'zod';
import { JobService } from '../services/jobService';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
const jobService = new JobService();

const querySchema = z.object({
  companyId: z.string().uuid().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => parseInt(val)).optional(),
  offset: z.string().transform(val => parseInt(val)).optional(),
  search: z.string().optional(),
});

// GET /api/jobs
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const filters = querySchema.parse(req.query);
    const result = await jobService.findAll(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const job = await jobService.findById(req.params.id);
    if (!job) {
      throw createError('Job not found', 404);
    }
    res.json({ job });
  } catch (error) {
    next(error);
  }
});

export default router; 