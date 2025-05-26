import { db } from '../config/database';
import { Company } from '../types';

export class CompanyService {
  async findAll(): Promise<Company[]> {
    const result = await db.query(
      'SELECT id, name, careers_url, logo_url, is_active, last_scraped_at, created_at, updated_at FROM companies WHERE is_active = true ORDER BY name'
    );

    return result.rows.map(this.mapDbToCompany);
  }

  async create(companyData: {
    name: string;
    careersUrl: string;
    logoUrl?: string;
  }): Promise<Company> {
    const result = await db.query(
      `INSERT INTO companies (name, careers_url, logo_url)
       VALUES ($1, $2, $3)
       RETURNING id, name, careers_url, logo_url, is_active, last_scraped_at, created_at, updated_at`,
      [companyData.name, companyData.careersUrl, companyData.logoUrl]
    );

    return this.mapDbToCompany(result.rows[0]);
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
} 