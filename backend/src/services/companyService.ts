import { db } from '../config/database';
import { Company } from '../types';

export class CompanyService {
  async findAll(): Promise<Company[]> {
    const result = await db.query(
      'SELECT id, name, careers_url, logo_url, is_active, last_scraped_at, created_at, updated_at FROM companies WHERE is_active = true ORDER BY name'
    );

    return result.rows.map(this.mapDbToCompany);
  }

  async findById(id: string): Promise<Company | null> {
    const result = await db.query(
      'SELECT id, name, careers_url, logo_url, is_active, last_scraped_at, created_at, updated_at FROM companies WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapDbToCompany(result.rows[0]);
  }

  async findByUrl(careersUrl: string): Promise<Company | null> {
    const result = await db.query(
      'SELECT id, name, careers_url, logo_url, is_active, last_scraped_at, created_at, updated_at FROM companies WHERE careers_url = $1',
      [careersUrl]
    );

    if (result.rows.length === 0) return null;
    return this.mapDbToCompany(result.rows[0]);
  }

  async create(companyData: {
    name: string;
    careersUrl: string;
    logoUrl?: string;
  }): Promise<Company> {
    // Check if company with this URL already exists
    const existing = await this.findByUrl(companyData.careersUrl);
    if (existing) {
      throw new Error('Company with this careers URL already exists');
    }

    const result = await db.query(
      `INSERT INTO companies (name, careers_url, logo_url)
       VALUES ($1, $2, $3)
       RETURNING id, name, careers_url, logo_url, is_active, last_scraped_at, created_at, updated_at`,
      [companyData.name, companyData.careersUrl, companyData.logoUrl]
    );

    return this.mapDbToCompany(result.rows[0]);
  }

  async update(id: string, updates: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Company | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${this.camelToSnake(key)} = $${index + 2}`)
      .join(', ');

    if (!setClause) return this.findById(id);

    const values = [id, ...Object.values(updates)];
    
    const result = await db.query(
      `UPDATE companies SET ${setClause}
       WHERE id = $1
       RETURNING id, name, careers_url, logo_url, is_active, last_scraped_at, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) return null;
    return this.mapDbToCompany(result.rows[0]);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await db.query(
      'UPDATE companies SET is_active = false WHERE id = $1',
      [id]
    );

    return result.rowCount > 0;
  }

  async updateLastScrapedAt(id: string): Promise<void> {
    await db.query(
      'UPDATE companies SET last_scraped_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  private mapDbToCompany(row: any): Company {
    return {
      id: row.id,
      name: row.name,
      careersUrl: row.careers_url,
      logoUrl: row.logo_url,
      isActive: row.is_active,
      lastScrapedAt: row.last_scraped_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
} 