import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
let token: string;
let companyId: string;
let jobId: string;

const testApi = async () => {
  try {
    console.log('Starting API tests...\n');

    // 1. Register
    console.log('Testing registration...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: `test${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      password: 'password123'
    });
    token = registerResponse.data.accessToken;
    console.log('✅ Registration successful\n');

    // 2. Create Company
    console.log('Testing company creation...');
    const companyResponse = await axios.post(
      `${API_URL}/companies`,
      {
        name: 'Test Company',
        careersUrl: `https://careers.testcompany.com/${Date.now()}`,
        logoUrl: 'https://logo.clearbit.com/testcompany.com'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    companyId = companyResponse.data.company.id;
    console.log('✅ Company creation successful\n');

    // 3. Get Companies
    console.log('Testing company listing...');
    const companiesResponse = await axios.get(
      `${API_URL}/companies`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log(`✅ Found ${companiesResponse.data.companies.length} companies\n`);

    // 4. Create Job
    console.log('Testing job creation...');
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
    console.log('✅ Job creation successful\n');

    // 5. Get Jobs
    console.log('Testing job listing...');
    const jobsResponse = await axios.get(
      `${API_URL}/jobs`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log(`✅ Found ${jobsResponse.data.jobs.length} jobs\n`);

    console.log('All tests completed successfully! 🎉');
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Run the tests
testApi(); 