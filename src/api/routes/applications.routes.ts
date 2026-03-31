import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ success: true, data: { id: req.params.id } });
});

router.patch('/:id', (req, res) => {
  res.status(200).json({ success: true, data: { id: req.params.id, ...req.body } });
});

export const applicationsRouter = router;
