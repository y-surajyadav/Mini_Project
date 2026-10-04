import { Router, Response } from 'express';
import { dbStore } from '../models/store.js';
import { authenticateToken, AuthenticatedRequest, requireWarehouseStaff } from '../middleware/auth.js';
import { InventoryMovement, MovementType } from '../models/types.js';
import { ReorderService } from '../services/reorderService.js';

const router = Router();

// GET /api/v1/inventory/movements - View ledger
router.get('/movements', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { productId, movementType } = req.query;
  let list = [...dbStore.movements];

  if (productId && typeof productId === 'string') {
    list = list.filter(m => m.productId === productId);
  }

  if (movementType && typeof movementType === 'string' && movementType !== 'ALL') {
    list = list.filter(m => m.movementType === movementType);
  }

  list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return res.json({
    success: true,
    total: list.length,
    movements: list
  });
});

// POST /api/v1/inventory/movements - Record movement in ledger
router.post('/movements', authenticateToken, requireWarehouseStaff, (req: AuthenticatedRequest, res: Response) => {
  const { productId, movementType, quantity, referenceNumber, reason } = req.body;

  if (!productId || !movementType || quantity === undefined) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'productId, movementType, and quantity are required.'
    });
  }

  const prod = dbStore.products.get(productId);
  if (!prod) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const qty = Number(quantity);
  const previousStock = prod.onHandStock;
  let newStock = previousStock;

  switch (movementType as MovementType) {
    case 'stock_in':
    case 'return':
      newStock = previousStock + Math.abs(qty);
      break;
    case 'stock_out':
      if (previousStock < Math.abs(qty)) {
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: `Cannot dispatch ${Math.abs(qty)} units. Available on-hand stock is only ${previousStock}.`
        });
      }
      newStock = previousStock - Math.abs(qty);
      break;
    case 'adjustment':
      newStock = Math.max(0, previousStock + qty);
      break;
    default:
      return res.status(400).json({
        success: false,
        error: 'INVALID_MOVEMENT_TYPE',
        message: 'movementType must be one of: stock_in, stock_out, adjustment, return.'
      });
  }

  // Update product stock level atomically
  prod.onHandStock = newStock;
  prod.updatedAt = new Date().toISOString();

  // Create immutable movement entry
  const movement: InventoryMovement = {
    id: `mov_${Date.now()}`,
    productId: prod.id,
    movementType: movementType as MovementType,
    quantity: qty,
    previousStock,
    newStock,
    referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
    reason: reason || 'Operational inventory movement',
    userId: req.user!.id,
    userName: req.user!.name,
    timestamp: new Date().toISOString()
  };

  dbStore.movements.unshift(movement);

  // Recalculate recommendations & alerts
  ReorderService.refreshAllRecommendations();

  dbStore.recordAudit(req.user!.id, req.user!.username, 'INVENTORY_MOVEMENT', 'InventoryMovement', {
    movementType,
    quantity: qty,
    productId: prod.id,
    previousStock,
    newStock
  }, movement.id);

  return res.status(201).json({
    success: true,
    movement,
    updatedProduct: prod
  });
});

// GET /api/v1/inventory/recommendations - Advisory reorder suggestions
router.get('/recommendations', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const result = ReorderService.refreshAllRecommendations();
  return res.json({
    success: true,
    total: result.recommendations.length,
    recommendations: result.recommendations
  });
});

// PUT /api/v1/inventory/recommendations/:id/review - Manager review
router.put('/recommendations/:id/review', authenticateToken, requireWarehouseStaff, (req: AuthenticatedRequest, res: Response) => {
  const rec = dbStore.reorderRecommendations.get(req.params.id);
  if (!rec) {
    return res.status(404).json({ success: false, error: 'Recommendation not found' });
  }

  const { reviewStatus, managerNotes } = req.body;
  if (!['approved_by_manager', 'rejected', 'pending_review'].includes(reviewStatus)) {
    return res.status(400).json({ success: false, error: 'Invalid reviewStatus' });
  }

  rec.reviewStatus = reviewStatus;
  if (managerNotes) rec.managerNotes = managerNotes;

  dbStore.recordAudit(req.user!.id, req.user!.username, 'REVIEW_REORDER_RECOMMENDATION', 'ReorderRecommendation', {
    recommendationId: rec.id,
    reviewStatus,
    managerNotes
  }, rec.id);

  return res.json({ success: true, recommendation: rec });
});

// GET /api/v1/inventory/alerts - Active stockout risk alerts
router.get('/alerts', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const result = ReorderService.refreshAllRecommendations();
  return res.json({
    success: true,
    total: result.alerts.length,
    alerts: result.alerts
  });
});

// PUT /api/v1/inventory/alerts/:id/acknowledge
router.put('/alerts/:id/acknowledge', authenticateToken, requireWarehouseStaff, (req: AuthenticatedRequest, res: Response) => {
  const alert = dbStore.stockoutAlerts.get(req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  alert.status = 'acknowledged';
  dbStore.recordAudit(req.user!.id, req.user!.username, 'ACKNOWLEDGE_ALERT', 'StockoutAlert', {
    alertId: alert.id,
    sku: alert.sku
  }, alert.id);

  return res.json({ success: true, alert });
});

export default router;
