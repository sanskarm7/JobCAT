import { Router } from 'express';

const router = Router();

// GET /api/users/profile
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint - to be implemented' });
});

// PUT /api/users/profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile endpoint - to be implemented' });
});

export default router; 