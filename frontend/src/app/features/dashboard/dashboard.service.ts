import { Injectable, inject } from '@angular/core';
import { DefaultService, ApplicationsService } from '@generated/api';
import { JobListing, JobStatus, ApplicationDecision } from '@shared/types/job.types';
import { Observable, map } from 'rxjs';

export interface DashboardStats {
  pendingCount: number;
  reviewCount: number;
  appliedCount: number;
  failedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly jobsApi = inject(DefaultService);
  private readonly appsApi = inject(ApplicationsService);

  getReviewJobs(page = 1, limit = 20): Observable<JobListing[]> {
    return this.jobsApi.jobsGet({ status: 'REVIEW', page, limit }).pipe(
      map((res: any) => res.data || [])
    );
  }

  getStats(): Observable<DashboardStats> {
    return this.jobsApi.jobsStatsGet().pipe(
      map((res: any) => ({
        reviewCount: res.reviewCount || 0,
        appliedCount: res.appliedCount || 0,
        pendingCount: res.pendingCount || 0,
        failedCount: res.failedCount || 0
      }))
    );
  }

  approveApplication(applicationId: string): Observable<boolean> {
    return this.appsApi.applicationsIdPatch({
      id: applicationId,
      applicationsIdPatchRequest: {
        decision: 'APPROVED'
      }
    }).pipe(
      map(() => true)
    );
  }

  rejectApplication(applicationId: string): Observable<boolean> {
    return this.appsApi.applicationsIdPatch({
      id: applicationId,
      applicationsIdPatchRequest: {
        decision: 'REJECTED'
      }
    }).pipe(
      map(() => true)
    );
  }
}
