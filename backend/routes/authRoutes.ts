import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../models/store';
import { CONFIG } from '../config/index';
import { authenticateToken, AuthenticatedRequest, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_CREDENTIALS',
      message: 'Username and password are required.'
    });
  }

  // Find user in store
  const user = Array.from(dbStore.users.values()).find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid username or password.'
    });
  }

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email
  };

  const token = jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '24h' });

  dbStore.recordAudit(user.id, user.username, 'USER_LOGIN', 'User', {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }, user.id);

  return res.json({
    success: true,
    token,
    user: payload
  });
});

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// Admin: list all users
router.get('/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = Array.from(dbStore.users.values()).map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    email: u.email,
    createdAt: u.createdAt
  }));
  return res.json({ success: true, users });
});

export default router;
