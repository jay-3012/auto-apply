import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../queues/connection.js';
import type { ProcessJobPayload } from '#types/queue.types.js';
import { JobListing } from '../db/models/job-listing.model.js';
import { Resume } from '../db/models/resume.model.js';
import { Application } from '../db/models/application.model.js';
import { JobStatus } from '#types/db.types.js';
import { calculateFitScore } from '../intelligence/prompts/fit-score.js';
import { calculateAtsScore } from '../intelligence/prompts/ats-score.js';
import { tailorResume } from '../intelligence/prompts/tailor-resume.js';
import { searchCompany } from '../intelligence/research/searxng-client.js';
import { summarizeResearch } from '../intelligence/prompts/company-research.js';
import { githubResumeClient } from '../resume/github-client.js';
import { ApplicationDecision } from '#types/db.types.js';

export const processJobWorker = new Worker<ProcessJobPayload>(
  'process-job',
  async (job: Job<ProcessJobPayload>) => {
    const { jobListingId } = job.data;
    console.log(`[process-job] Starting job ${job.id} for jobListingId ${jobListingId}`);

    // FETCH JOB LISTING
    const jobListing = await JobListing.findByPk(jobListingId);
    if (!jobListing) {
      throw new Error(`JobListing ${jobListingId} not found`);
    }

    // FETCH BASE RESUME
    const baseResume = await Resume.findOne({ where: { isBase: true } });
    if (!baseResume) {
      throw new Error('Base resume not found. Please seed a base resume.');
    }

    try {
      // 1. ROLE FIT SCORE
      console.log(`[process-job] [${jobListingId}] Calculating fit score...`);
      const { score: fitScore, reasoning: fitReasoning } = await calculateFitScore(
        jobListing.jdText,
        baseResume.texContent
      );

      // 2. FILTERING
      if (fitScore < 65) {
        console.log(`[process-job] [${jobListingId}] Fit score ${fitScore} below threshold. Filtering.`);
        await jobListing.update({ status: JobStatus.FILTERED });
        return { success: true, status: 'FILTERED' };
      }

      // 3. ATS SCORE + GAP ANALYSIS
      console.log(`[process-job] [${jobListingId}] Calculating ATS score & gaps...`);
      const { score: atsScore, gapAnalysis } = await calculateAtsScore(
        jobListing.jdText,
        baseResume.texContent
      );

      // 4. RESUME TAILORING (Pass 1 & 2)
      console.log(`[process-job] [${jobListingId}] Tailoring resume...`);
      const tailoredTex = await tailorResume(jobListing.jdText, baseResume.texContent);

      // PUSH TO GITHUB (Sprint 4)
      const branchName = `job-${jobListingId}`;
      const sha = await githubResumeClient.pushTailoredResume(branchName, tailoredTex);
      console.log(`[github-client] Successfully pushed to ${branchName}. Commit: ${sha}`);
      console.log(`[process-job] [${jobListingId}] Researching company: ${jobListing.company}`);
      const rawResults = await searchCompany(jobListing.company);
      const researchSummary = await summarizeResearch(jobListing.company, rawResults);

      // CREATE TAILORED RESUME RECORD
      const tailoredResume = await Resume.create({
        version: `tailored-${jobListingId}`,
        texContent: tailoredTex,
        isBase: false,
        pdfUrl: null // Will be completed in Sprint 4
      });

      // CREATE APPLICATION RECORD
      await Application.create({
        jobId: jobListingId,
        resumeId: tailoredResume.id,
        fitScore,
        aiReasoning: fitReasoning,
        atsScore,
        gapAnalysis,
        decision: ApplicationDecision.PENDING
      });

      // UPDATE JOB STATUS
      await jobListing.update({ status: JobStatus.REVIEW });
      
      console.log(`[process-job] [${jobListingId}] Intelligence pipeline complete. Status: REVIEW.`);
      return { success: true, status: 'REVIEW', applicationId: jobListingId };

    } catch (error) {
      console.error(`[process-job] [${jobListingId}] Pipeline error:`, error);
      throw error; // Re-throw to trigger BullMQ retry
    }
  },
  { connection: redisConnection },
);

processJobWorker.on('completed', (job) => {
  console.log(`[process-job] Completed job ${job.id}`);
});

processJobWorker.on('failed', (job, err) => {
  console.error(`[process-job] Failed job ${job?.id}:`, err);
});
