import request from 'supertest';
import app from '../../server';
import { db } from '../../config/database';

describe('Company API', () => {
  let token: string;

  beforeAll(async () => {
    // Create test user first
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test-company${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
    
    token = registerResponse.body.accessToken;
  });

  it('should create a new company', async () => {
    const response = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Company',
        careersUrl: 'https://test.com/careers'
      });

    expect(response.status).toBe(201);
    expect(response.body.company).toHaveProperty('id');
  });
}); 