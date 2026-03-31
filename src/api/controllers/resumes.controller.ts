import { Request, Response } from 'express';
import { Resume } from '../../db/models/resume.model.js';
import { success, failure } from '../../utils/response.js';
import { AppError } from '../../utils/app-error.js';

export const getResumes = async (req: Request, res: Response) => {
  try {
    const isBase = req.query.isBase === 'true';
    const resumes = await Resume.findAll({
      where: req.query.isBase ? { isBase } : {}
    });
    success(res, resumes);
  } catch (error: any) {
    failure(res, new AppError(error.message, 500));
  }
};

export const getResumeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findByPk(id as string);
    if (!resume) {
      return failure(res, new AppError('Resume not found', 404));
    }
    success(res, resume);
  } catch (error: any) {
    failure(res, new AppError(error.message, 500));
  }
};

export const updateResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findByPk(id as string);
    if (!resume) {
      return failure(res, new AppError('Resume not found', 404));
    }
    await resume.update(req.body);
    success(res, resume);
  } catch (error: any) {
    failure(res, new AppError(error.message, 500));
  }
};

/**
 * Endpoint for GitHub Actions to report back the compiled PDF URL.
 */
export const handleCompiledResume = async (req: Request, res: Response) => {
  try {
    const { branchName, artifactUrl } = req.body;
    console.log(`[resumes-controller] Received compilation report for ${branchName}: ${artifactUrl}`);

    // Extract jobListingId from branchName (job-{id})
    const jobListingId = branchName.replace('job-', '');

    // Find the tailored resume record for this job
    const resume = await Resume.findOne({
      where: { version: `tailored-${jobListingId}` }
    });

    if (!resume) {
      console.error(`[resumes-controller] Resume record for tailored-${jobListingId} not found`);
      return failure(res, new AppError('Resume record not found', 404));
    }

    await resume.update({ pdfUrl: artifactUrl });
    console.log(`[resumes-controller] Updated PDF URL for resume ${resume.id}`);

    success(res, { message: 'Resume updated successfully' });
  } catch (error: any) {
    console.error('[resumes-controller] Error handling compiled resume:', error);
    failure(res, new AppError(error.message, 500));
  }
};
