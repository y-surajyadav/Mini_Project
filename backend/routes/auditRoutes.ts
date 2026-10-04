import { Router, Response } from 'express';
import { dbStore } from '../models/store.js';
import { authenticateToken, AuthenticatedRequest, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/audit/logs (Admin only)
router.get('/logs', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { action, limit = 100 } = req.query;
  let logs = [...dbStore.auditLogs];

  if (action && typeof action === 'string' && action !== 'ALL') {
    logs = logs.filter(l => l.action === action);
  }

  const maxLogs = Math.min(parseInt(limit as string, 10) || 100, 200);
  return res.json({
    success: true,
    total: logs.length,
    logs: logs.slice(0, maxLogs)
  });
});

export default router;
