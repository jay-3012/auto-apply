export enum JobStatus {
  PENDING = 'PENDING',
  FILTERED = 'FILTERED',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Platform {
  NAUKRI = 'naukri',
  INDEED = 'indeed',
  WELLFOUND = 'wellfound',
  INTERNSHALA = 'internshala',
}

export enum ApplicationDecision {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ApplicationResult {
  APPLIED = 'APPLIED',
  FAILED = 'FAILED',
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  platform: Platform;
  url: string;
  jdText: string;
  salary: string | null;
  location: string | null;
  externalId: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  application?: Application;
}

export interface Application {
  id: string;
  jobId: string;
  resumeId: string | null;
  atsScore: number | null;
  fitScore: number | null;
  aiReasoning: string | null;
  gapAnalysis: string[] | null;
  decision: ApplicationDecision;
  result: ApplicationResult | null;
  appliedAt: string | null;
  screenshotUrl: string | null;
  createdAt: string;
  updatedAt: string;
  jobListing?: JobListing;
}

export interface RoleConfig {
  id: string;
  roleName: string;
  keywords: string[];
  minAtsThreshold: number;
  isActive: boolean;
}
