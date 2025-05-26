export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobField?: string;
  location?: string;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  careersUrl: string;
  logoUrl?: string;
  isActive: boolean;
  lastScrapedAt?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
} 