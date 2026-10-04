import { Router, Response } from 'express';
import { MLBridgeService } from '../services/mlBridgeService.js';
import { authenticateToken, AuthenticatedRequest, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/ml/models - List all 6 candidate models with benchmarks
router.get('/models', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const models = MLBridgeService.getCandidateModels();
  return res.json({
    success: true,
    total: models.length,
    models
  });
});

// POST /api/v1/ml/select-production (Admin only)
router.post('/select-production', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { modelId, rationale } = req.body;

  if (!modelId || !rationale) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'modelId and rationale are required to promote a model to Production.'
    });
  }

  try {
    const updated = MLBridgeService.selectProductionModel(
      modelId, 
      rationale, 
      req.user!.id, 
      req.user!.username
    );
    return res.json({
      success: true,
      message: `Model '${updated.modelName}' successfully designated as Production Forecasting Engine.`,
      productionModel: updated
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'SELECTION_ERROR',
      message: err.message
    });
  }
});

// POST /api/v1/ml/train (Admin only)
router.post('/train', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { models = ['linear_regression', 'arima', 'prophet', 'xgboost', 'lightgbm', 'catboost'], horizon = 28, sampleRatio = 0.1 } = req.body;

  try {
    const job = await MLBridgeService.submitTrainingJob(models, horizon, sampleRatio);
    return res.json({
      success: true,
      job
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'TRAINING_BLOCKED',
      message: err.message
    });
  }
});

// GET /api/v1/ml/forecast - Demand forecast for product
router.get('/forecast', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const sku = (req.query.sku as string) || 'FOODS_3_090_CA_3';
  const horizon = req.query.horizon ? parseInt(req.query.horizon as string, 10) : 28;

  try {
    const forecast = await MLBridgeService.getForecastForProduct(sku, horizon);
    return res.json({
      success: true,
      forecast
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'FORECAST_UNAVAILABLE',
      message: err.message
    });
  }
});

// GET /api/v1/ml/explain/shap - Explainability insights
router.get('/explain/shap', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const sku = (req.query.sku as string) || 'FOODS_3_090_CA_3';
  const modelId = req.query.modelId as string | undefined;

  const explanation = MLBridgeService.getShapExplanations(sku, modelId);
  return res.json({
    success: true,
    explanation
  });
});

export default router;
