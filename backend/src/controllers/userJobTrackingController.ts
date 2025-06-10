import { Router, Response } from 'express';
import { z } from 'zod';
import { UserJobTrackingService } from '../services/userJobTrackingService';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { ApplicationStatus } from '../types';

const router = Router();
const trackingService = new UserJobTrackingService();

const createTrackingSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum([
    'interested',
    'applied',
    'interviewing',
    'offer',
    'rejected',
    'withdrawn'
  ] as const),
  notes: z.string().optional(),
});

const updateTrackingSchema = z.object({
  status: z.enum([
    'interested',
    'applied',
    'interviewing',
    'offer',
    'rejected',
    'withdrawn'
  ] as const),
  notes: z.string().optional(),
});

// GET /api/tracking
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const trackings = await trackingService.findAllByUser(req.user!.id);
    res.json({ trackings });
  } catch (error) {
    next(error);
  }
});

// POST /api/tracking
router.post('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createTrackingSchema.parse(req.body);
    const tracking = await trackingService.create({
      userId: req.user!.id,
      ...data,
    });
    res.status(201).json({ tracking });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tracking/:jobId
router.put('/:jobId', async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateTrackingSchema.parse(req.body);
    const tracking = await trackingService.updateStatus(
      req.user!.id,
      req.params.jobId,
      data.status,
      data.notes
    );
    if (!tracking) {
      throw createError('Tracking not found', 404);
    }
    res.json({ tracking });
  } catch (error) {
    next(error);
  }
});

export default router; 