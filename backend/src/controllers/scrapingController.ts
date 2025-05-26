import { Router } from 'express';

const router = Router();

// POST /api/scraping/analyze
router.post('/analyze', (req, res) => {
  res.json({ message: 'Scraping analysis endpoint - to be implemented' });
});

export default router; 