import { Router, Response } from 'express';
import { DatasetService } from '../services/datasetService';
import { authenticateToken, AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { CONFIG } from '../config/index';
import { dbStore } from '../models/store';

const router = Router();

// GET /api/v1/dataset/status - Validate M5 dataset
router.get('/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await DatasetService.validateDataset();
    return res.json({
      success: true,
      report
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'DATASET_VALIDATION_ERROR',
      message: err.message
    });
  }
});

// POST /api/v1/dataset/configure-path (Admin only)
router.post('/configure-path', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { datasetDir } = req.body;
  if (!datasetDir || typeof datasetDir !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PATH',
      message: 'datasetDir string is required.'
    });
  }

  CONFIG.DATASET_DIR = datasetDir;
  const report = await DatasetService.validateDataset(datasetDir);

  dbStore.recordAudit(req.user!.id, req.user!.username, 'CONFIGURE_DATASET_PATH', 'Dataset', {
    newPath: datasetDir,
    isValid: report.isValid
  });

  return res.json({
    success: true,
    message: `Dataset path updated to '${datasetDir}'.`,
    report
  });
});

export default router;
