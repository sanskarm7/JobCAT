export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobField?: string;
  location?: string;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  careersUrl: string;
  logoUrl?: string;
  isActive: boolean;
  lastScrapedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  location?: string;
  department?: string;
  jobType?: string;
  salaryRange?: string;
  jobUrl: string;
  externalId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: Company;
}

export enum ApplicationStatus {
  INTERESTED = 'interested',
  APPLIED = 'applied',
  INTERVIEWING = 'interviewing',
  OFFER = 'offer',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface UserJobTracking {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  notes?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  job?: Job;
}

export interface ScrapingRule {
  id: string;
  companyId: string;
  selectors: {
    jobContainer: string;
    title: string;
    location?: string;
    department?: string;
    jobType?: string;
    link: string;
    description?: string;
  };
  isAiGenerated: boolean;
  isVerified: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 