import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { UserService } from '../services/userService';
import { createError } from '../middleware/errorHandler';

const router = Router();
const userService = new UserService();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(6),
  jobField: z.string().optional(),
  location: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Register
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await userService.findByEmail(validatedData.email);
    if (existingUser) {
      throw createError('User with this email already exists', 400);
    }

    // Create user
    const user = await userService.create(validatedData);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken: token,
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await userService.findByEmail(email);
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw createError('Invalid email or password', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken: token,
    });
  } catch (error) {
    next(error);
  }
});

export default router; 