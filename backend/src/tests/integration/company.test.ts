import request from 'supertest';
import app from '../../server';
import { db } from '../../config/database';

describe('Company API', () => {
  let token: string;

  beforeAll(async () => {
    // Setup test user and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = response.body.accessToken;
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