// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.NODE_ENV = 'test';

import app from '../server';
import { db } from '../config/database';

let server: any;
export let testPort: number;

beforeAll(async () => {
  // Find an available port
  testPort = await getAvailablePort();
  
  // Clear test database in correct order due to foreign key constraints
  await db.query('DELETE FROM user_job_tracking');
  await db.query('DELETE FROM jobs');
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM users');
  
  // Start server on available port
  server = app.listen(testPort);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for server to start
});

async function getAvailablePort(): Promise<number> {
  const { createServer } = require('net');
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

afterAll(async () => {
  // Clean up
  await db.query('DELETE FROM user_job_tracking');
  await db.query('DELETE FROM jobs');
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM users');
  
  // Close server
  await new Promise(resolve => server.close(resolve));
  
  // Close database connection
  await db.disconnect();
}); 