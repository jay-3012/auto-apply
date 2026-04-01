import { Router } from 'express';
// Assuming passport is configured elsewhere
const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticates the user and returns a session token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login success }
 *       401: { description: Invalid credentials }
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
 
  if (username === 'admin' && password === 'password') {
    res.status(200).json({ success: true, token: 'stub-session-token' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials. Use admin/password' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Invalidate the user session.
 *     responses:
 *       200: { description: Logout success }
 */
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true });
});

export const authRouter = router;
