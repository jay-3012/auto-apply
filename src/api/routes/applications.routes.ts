import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /applications:
 *   get:
 *     tags: [Applications]
 *     summary: List applications
 *     description: Returns a list of applications with optional result filter.
 *     parameters:
 *       - in: query
 *         name: result
 *         schema:
 *           type: string
 *           enum: [APPLIED, FAILED]
 *     responses:
 *       200: { description: List of applications }
 */
router.get('/', (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     tags: [Applications]
 *     summary: Get single application
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Application details }
 *   patch:
 *     tags: [Applications]
 *     summary: Update application decision or result
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
 *               decision: { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *               result: { type: string, enum: [APPLIED, FAILED] }
 *     responses:
 *       200: { description: Application updated }
 */
router.get('/:id', (req, res) => {
  res.status(200).json({ success: true, data: { id: req.params.id } });
});

router.patch('/:id', (req, res) => {
  res.status(200).json({ success: true, data: { id: req.params.id, ...req.body } });
});

export const applicationsRouter = router;
