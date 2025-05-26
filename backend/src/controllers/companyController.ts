import { Router, Response } from 'express';
import { z } from 'zod';
import { CompanyService } from '../services/companyService';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
const companyService = new CompanyService();

const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
  careersUrl: z.string().url(),
  logoUrl: z.string().url().optional(),
});

const updateCompanySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  careersUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/companies
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const companies = await companyService.findAll();
    res.json({ companies });
  } catch (error) {
    next(error);
  }
});

// GET /api/companies/:id
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const company = await companyService.findById(req.params.id);
    if (!company) {
      throw createError('Company not found', 404);
    }
    res.json({ company });
  } catch (error) {
    next(error);
  }
});

// POST /api/companies
router.post('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const companyData = createCompanySchema.parse(req.body);
    const company = await companyService.create(companyData);
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    next(error);
  }
});

// PUT /api/companies/:id
router.put('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const updates = updateCompanySchema.parse(req.body);
    const company = await companyService.update(req.params.id, updates);
    if (!company) {
      throw createError('Company not found', 404);
    }
    res.json({ message: 'Company updated successfully', company });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/companies/:id (soft delete)
router.delete('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const success = await companyService.softDelete(req.params.id);
    if (!success) {
      throw createError('Company not found', 404);
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router; 