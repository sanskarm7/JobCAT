import { db } from '../config/database';
import { Job } from '../types';

export class JobService {
  async findAll(filters?: {
    companyId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ jobs: Job[], total: number }> {
    let whereClause = 'WHERE 1=1';
    let queryParams: any[] = [];
    let paramCount = 0;

    if (filters?.companyId) {
      whereClause += ` AND j.company_id = $${++paramCount}`;
      queryParams.push(filters.companyId);
    }

    if (filters?.isActive !== undefined) {
      whereClause += ` AND j.is_active = $${++paramCount}`;
      queryParams.push(filters.isActive);
    }

    if (filters?.search) {
      whereClause += ` AND (j.title ILIKE $${++paramCount} OR j.description ILIKE $${++paramCount})`;
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      paramCount++;
    }

    // Count total
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM jobs j ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get jobs with pagination
    let limitClause = '';
    if (filters?.limit) {
      limitClause += ` LIMIT $${++paramCount}`;
      queryParams.push(filters.limit);
    }
    if (filters?.offset) {
      limitClause += ` OFFSET $${++paramCount}`;
      queryParams.push(filters.offset);
    }

    const result = await db.query(
      `SELECT j.id, j.company_id, j.title, j.description, j.location, j.department, 
              j.job_type, j.salary_range, j.job_url, j.external_id, j.is_active, 
              j.created_at, j.updated_at,
              c.name as company_name, c.careers_url, c.logo_url
       FROM jobs j
       LEFT JOIN companies c ON j.company_id = c.id
       ${whereClause}
       ORDER BY j.created_at DESC
       ${limitClause}`,
      queryParams
    );

    const jobs = result.rows.map(this.mapDbToJob);
    return { jobs, total };
  }

  async findById(id: string): Promise<Job | null> {
    const result = await db.query(
      `SELECT j.id, j.company_id, j.title, j.description, j.location, j.department, 
              j.job_type, j.salary_range, j.job_url, j.external_id, j.is_active, 
              j.created_at, j.updated_at,
              c.name as company_name, c.careers_url, c.logo_url
       FROM jobs j
       LEFT JOIN companies c ON j.company_id = c.id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapDbToJob(result.rows[0]);
  }

  async findByExternalId(companyId: string, externalId: string): Promise<Job | null> {
    const result = await db.query(
      `SELECT j.id, j.company_id, j.title, j.description, j.location, j.department, 
              j.job_type, j.salary_range, j.job_url, j.external_id, j.is_active, 
              j.created_at, j.updated_at,
              c.name as company_name, c.careers_url, c.logo_url
       FROM jobs j
       LEFT JOIN companies c ON j.company_id = c.id
       WHERE j.company_id = $1 AND j.external_id = $2`,
      [companyId, externalId]
    );

    if (result.rows.length === 0) return null;
    return this.mapDbToJob(result.rows[0]);
  }

  async create(jobData: {
    companyId: string;
    title: string;
    description?: string;
    location?: string;
    department?: string;
    jobType?: string;
    salaryRange?: string;
    jobUrl: string;
    externalId: string;
  }): Promise<Job> {
    const result = await db.query(
      `INSERT INTO jobs (company_id, title, description, location, department, job_type, salary_range, job_url, external_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, company_id, title, description, location, department, job_type, salary_range, job_url, external_id, is_active, created_at, updated_at`,
      [
        jobData.companyId,
        jobData.title,
        jobData.description,
        jobData.location,
        jobData.department,
        jobData.jobType,
        jobData.salaryRange,
        jobData.jobUrl,
        jobData.externalId
      ]
    );

    // Get the job with company info
    return this.findById(result.rows[0].id)!;
  }

  async update(id: string, updates: Partial<Omit<Job, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'company'>>): Promise<Job | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${this.camelToSnake(key)} = $${index + 2}`)
      .join(', ');

    if (!setClause) return this.findById(id);

    const values = [id, ...Object.values(updates)];
    
    const result = await db.query(
      `UPDATE jobs SET ${setClause}
       WHERE id = $1
       RETURNING id`,
      values
    );

    if (result.rows.length === 0) return null;
    return this.findById(id);
  }

  async bulkUpsert(jobs: Array<{
    companyId: string;
    title: string;
    description?: string;
    location?: string;
    department?: string;
    jobType?: string;
    salaryRange?: string;
    jobUrl: string;
    externalId: string;
  }>): Promise<{ created: number, updated: number }> {
    let created = 0;
    let updated = 0;

    for (const jobData of jobs) {
      const existing = await this.findByExternalId(jobData.companyId, jobData.externalId);
      
      if (existing) {
        await this.update(existing.id, {
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          department: jobData.department,
          jobType: jobData.jobType,
          salaryRange: jobData.salaryRange,
          jobUrl: jobData.jobUrl,
          isActive: true
        });
        updated++;
      } else {
        await this.create(jobData);
        created++;
      }
    }

    return { created, updated };
  }

  async markInactive(companyId: string, externalIds: string[]): Promise<number> {
    if (externalIds.length === 0) return 0;

    const placeholders = externalIds.map((_, index) => `$${index + 2}`).join(', ');
    const result = await db.query(
      `UPDATE jobs SET is_active = false 
       WHERE company_id = $1 AND external_id NOT IN (${placeholders})`,
      [companyId, ...externalIds]
    );

    return result.rowCount;
  }

  private mapDbToJob(row: any): Job {
    return {
      id: row.id,
      companyId: row.company_id,
      title: row.title,
      description: row.description,
      location: row.location,
      department: row.department,
      jobType: row.job_type,
      salaryRange: row.salary_range,
      jobUrl: row.job_url,
      externalId: row.external_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      company: row.company_name ? {
        id: row.company_id,
        name: row.company_name,
        careersUrl: row.careers_url,
        logoUrl: row.logo_url,
        isActive: true,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      } : undefined,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
} 