import { db } from '../config/database';
import { UserJobTracking, ApplicationStatus } from '../types';

export class UserJobTrackingService {
  async findAllByUser(userId: string): Promise<UserJobTracking[]> {
    const result = await db.query(
      `SELECT ujt.*, j.title as job_title, j.company_id, 
              c.name as company_name, c.logo_url
       FROM user_job_tracking ujt
       JOIN jobs j ON ujt.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE ujt.user_id = $1
       ORDER BY ujt.updated_at DESC`,
      [userId]
    );

    return result.rows.map(this.mapDbToTracking);
  }

  async create(data: {
    userId: string;
    jobId: string;
    status: ApplicationStatus;
    notes?: string;
    appliedAt?: Date;
  }): Promise<UserJobTracking> {
    const result = await db.query(
      `INSERT INTO user_job_tracking (user_id, job_id, status, notes, applied_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.userId, data.jobId, data.status, data.notes, data.appliedAt]
    );

    return this.mapDbToTracking(result.rows[0]);
  }

  async updateStatus(
    userId: string,
    jobId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<UserJobTracking | null> {
    const result = await db.query(
      `UPDATE user_job_tracking
       SET status = $3, notes = $4,
           applied_at = CASE 
             WHEN $3 = 'applied' AND status != 'applied' 
             THEN CURRENT_TIMESTAMP 
             ELSE applied_at 
           END
       WHERE user_id = $1 AND job_id = $2
       RETURNING *`,
      [userId, jobId, status, notes]
    );

    if (result.rows.length === 0) return null;
    return this.mapDbToTracking(result.rows[0]);
  }

  private mapDbToTracking(row: any): UserJobTracking {
    return {
      id: row.id,
      userId: row.user_id,
      jobId: row.job_id,
      status: row.status as ApplicationStatus,
      notes: row.notes,
      appliedAt: row.applied_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      job: row.job_title ? {
        id: row.job_id,
        title: row.job_title,
        companyId: row.company_id,
        company: {
          id: row.company_id,
          name: row.company_name,
          logoUrl: row.logo_url,
        },
      } : undefined,
    };
  }
} 