import { Router } from 'express';

const router = Router();

// GET /api/jobs
router.get('/', (req, res) => {
  res.json({ message: 'Jobs endpoint - to be implemented' });
});

export default router; 