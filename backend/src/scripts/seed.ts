import fs from 'fs';
import path from 'path';
import { db } from '../config/database';
import { logger } from '../config/logger';

async function runSeeds() {
  try {
    const seedsDir = path.join(__dirname, '../sql/seeds');
    const files = fs.readdirSync(seedsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        logger.info(`Running seed: ${file}`);
        const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
        await db.query(sql);
        logger.info(`Completed seed: ${file}`);
      }
    }

    logger.info('All seeds completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

runSeeds(); 