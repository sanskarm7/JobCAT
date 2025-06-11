import axios from 'axios';
import cheerio from 'cheerio';
import { CompanyService } from './companyService';
import { JobService } from './jobService';

interface JobData {
  companyId: string;
  title: string;
  description?: string;
  location?: string;
  department?: string;
  jobType?: string;
  salaryRange?: string;
  jobUrl: string;
  externalId: string;
}

export class ScrapingService {
  constructor(
    private companyService: CompanyService,
    private jobService: JobService
  ) {}

  async scrapeCompany(companyId: string) {
    const company = await this.companyService.findById(companyId);
    if (!company) throw new Error('Company not found');

    const html = await this.fetchHtml(company.careersUrl);
    const jobs = await this.extractJobs(html, company.id);
    
    return this.jobService.bulkUpsert(jobs);
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await axios.get(url);
    return response.data;
  }

  private async extractJobs(html: string, companyId: string): Promise<JobData[]> {
    // Basic extraction logic - will be enhanced with AI later
    const $ = cheerio.load(html);
    const jobs: JobData[] = [];
    
    // Example extraction - will need to be customized per company
    $('.job-listing').each((_, element) => {
      const jobUrl = $(element).find('a').attr('href');
      const externalId = $(element).attr('data-job-id');
      
      if (jobUrl && externalId) {  // Only push if required fields exist
        jobs.push({
          companyId,
          title: $(element).find('.title').text(),
          location: $(element).find('.location').text(),
          jobUrl,
          externalId
        });
      }
    });

    return jobs;
  }
} 