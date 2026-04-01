import { Router } from 'express';
import { getResumes, getResumeById, updateResume, handleCompiledResume } from '../controllers/resumes.controller.js';

const router = Router();

/**
 * @swagger
 * /resumes/{id}:
 *   get:
 *     tags: [Resumes]
 *     summary: Get single resume
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Resume details }
 *   patch:
 *     tags: [Resumes]
 *     summary: Update resume content or trigger recompile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               texContent: { type: string }
 *     responses:
 *       200: { description: Resume updated }
 */

router.get('/', getResumes);
router.get('/:id', getResumeById);
router.patch('/:id', updateResume);
router.post('/compiled', handleCompiledResume);

export const resumesRouter = router;
