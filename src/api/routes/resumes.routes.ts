import { Router } from 'express';
import { getResumes, getResumeById, updateResume, handleCompiledResume } from '../controllers/resumes.controller.js';

const router = Router();

router.get('/', getResumes);
router.get('/:id', getResumeById);
router.patch('/:id', updateResume);
router.post('/compiled', handleCompiledResume);

export const resumesRouter = router;
