import fs from 'fs';
import path from 'path';
import { db } from '../config/database';
import { logger } from '../config/logger';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Test database connection
    await db.query('SELECT 1');
    console.log('Database connection successful');

    const schemaDir = path.join(__dirname, '../sql/schema');
    
    if (!fs.existsSync(schemaDir)) {
      throw new Error(`Schema directory does not exist: ${schemaDir}`);
    }

    const files = fs.readdirSync(schemaDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      
      const filePath = path.join(schemaDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      if (!sql.trim()) {
        console.log(`Migration file ${file} is empty, skipping...`);
        continue;
      }
      
      await db.query(sql);
      console.log(`Completed migration: ${file}`);
    }

    console.log('All migrations completed successfully');
    logger.info('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run migrations
runMigrations()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  }); 