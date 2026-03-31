import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

router.post('/', (req, res) => {
  res.status(201).json({ success: true, data: req.body });
});

export const rolesRouter = router;
