import { db } from '../config/database';
import { logger } from '../config/logger';

async function resetDatabase() {
  try {
    logger.info('Resetting database...');
    
    // Drop all tables
    await db.query(`
      DROP TABLE IF EXISTS user_job_tracking CASCADE;
      DROP TABLE IF EXISTS scraping_rules CASCADE;
      DROP TABLE IF EXISTS jobs CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TYPE IF EXISTS application_status CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `);

    logger.info('Database reset completed');
  } catch (error) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

resetDatabase(); 