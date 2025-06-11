import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './logger';

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async query(text: string, params?: any[]): Promise<any> {
    try {
      const res = await this.pool.query(text, params);
      return res;
    } catch (error) {
      logger.error('Database query error', { text: text.substring(0, 100), params, error });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}

export const db = new Database(); 