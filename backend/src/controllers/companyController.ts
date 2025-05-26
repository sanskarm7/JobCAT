import { Router } from 'express';

const router = Router();

// GET /api/companies
router.get('/', (req, res) => {
  res.json({ message: 'Companies endpoint - to be implemented' });
});

// POST /api/companies
router.post('/', (req, res) => {
  res.json({ message: 'Add company endpoint - to be implemented' });
});

export default router; 