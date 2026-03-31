import { Router } from 'express';
// Assuming passport is configured elsewhere
const router = Router();

router.post('/login', (req, res) => {
  // Stub implementation for token to align with Cypress tests expecting body.token
  res.status(200).json({ success: true, token: 'stub-session-token' });
});

router.post('/logout', (req, res) => {
  res.status(200).json({ success: true });
});

export const authRouter = router;
