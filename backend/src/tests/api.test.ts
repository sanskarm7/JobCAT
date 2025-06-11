import axios from 'axios';
import { testPort } from './setup';

describe('API Integration Tests', () => {
  let API_URL: string;
  let token: string = '';
  let companyId: string = '';
  let jobId: string = '';
  
  beforeAll(() => {
    API_URL = `http://localhost:${testPort}/api`;
  });

  test('Complete API Flow', async () => {
    try {
      // 1. Registration
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      token = registerResponse.data.accessToken;
      expect(token).toBeTruthy();

      // 2. Create Company
      const companyResponse = await axios.post(
        `${API_URL}/companies`,
        {
          name: 'Test Company',
          careersUrl: 'https://example.com/careers'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      companyId = companyResponse.data.company.id;
      expect(companyId).toBeTruthy();

      // 3. Get Companies
      const companiesResponse = await axios.get(
        `${API_URL}/companies`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      expect(companiesResponse.data.companies).toBeDefined();
      expect(Array.isArray(companiesResponse.data.companies)).toBeTruthy();

      // 4. Create Job
      const jobResponse = await axios.post(
        `${API_URL}/jobs`,
        {
          companyId,
          title: 'Test Engineer',
          description: 'Testing job creation',
          location: 'Remote',
          jobUrl: `https://careers.testcompany.com/jobs/${Date.now()}`,
          externalId: `JOB${Date.now()}`
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      jobId = jobResponse.data.job.id;
      expect(jobId).toBeTruthy();

      // 5. Get Jobs
      const jobsResponse = await axios.get(
        `${API_URL}/jobs`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      expect(jobsResponse.data.jobs).toBeDefined();
      expect(Array.isArray(jobsResponse.data.jobs)).toBeTruthy();

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
        throw new Error(`API Error: ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  });
}); 