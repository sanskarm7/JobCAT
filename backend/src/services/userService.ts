import { db } from '../config/database';
import { User } from '../types';
import bcrypt from 'bcrypt';

export class UserService {
  async findById(id: string): Promise<User | null> {
    const result = await db.query(
      'SELECT id, email, first_name, last_name, job_field, location, email_notifications, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      jobField: user.job_field,
      location: user.location,
      emailNotifications: user.email_notifications,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const result = await db.query(
      'SELECT id, email, first_name, last_name, password_hash, job_field, location, email_notifications, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      passwordHash: user.password_hash,
      jobField: user.job_field,
      location: user.location,
      emailNotifications: user.email_notifications,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async create(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    jobField?: string;
    location?: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await db.query(
      `INSERT INTO users (email, first_name, last_name, password_hash, job_field, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, job_field, location, email_notifications, created_at, updated_at`,
      [userData.email, userData.firstName, userData.lastName, hashedPassword, userData.jobField, userData.location]
    );

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      jobField: user.job_field,
      location: user.location,
      emailNotifications: user.email_notifications,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async update(id: string, updates: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${this.camelToSnake(key)} = $${index + 2}`)
      .join(', ');

    if (!setClause) return this.findById(id);

    const values = [id, ...Object.values(updates)];
    
    const result = await db.query(
      `UPDATE users SET ${setClause}
       WHERE id = $1
       RETURNING id, email, first_name, last_name, job_field, location, email_notifications, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      jobField: user.job_field,
      location: user.location,
      emailNotifications: user.email_notifications,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
} 