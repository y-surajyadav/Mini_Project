import { Router, Response } from 'express';
import { dbStore } from '../models/store.js';
import { authenticateToken, AuthenticatedRequest, requireWarehouseStaff } from '../middleware/auth.js';
import { ReorderService } from '../services/reorderService.js';

const router = Router();

router.get('/export/:reportType', authenticateToken, requireWarehouseStaff, (req: AuthenticatedRequest, res: Response) => {
  const { reportType } = req.params;
  const timestamp = new Date().toISOString().split('T')[0];

  let csvContent = '';
  let filename = `report_${reportType}_${timestamp}.csv`;

  if (reportType === 'inventory') {
    csvContent = 'ID,SKU,Name,Category,Dept,Store,OnHandStock,SafetyStock,ConfirmedInbound,CommittedDemand,UnitCost,SellingPrice,Status\n';
    dbStore.products.forEach(p => {
      csvContent += `"${p.id}","${p.sku}","${p.name}","${p.category}","${p.deptId}","${p.storeId}",${p.onHandStock},${p.safetyStock},${p.confirmedInbound},${p.committedDemand},${p.unitCost},${p.sellingPrice},"${p.status}"\n`;
    });
  } else if (reportType === 'movements') {
    csvContent = 'MovementID,ProductID,MovementType,Quantity,PreviousStock,NewStock,ReferenceNumber,Reason,Operator,Timestamp\n';
    dbStore.movements.forEach(m => {
      csvContent += `"${m.id}","${m.productId}","${m.movementType}",${m.quantity},${m.previousStock},${m.newStock},"${m.referenceNumber}","${m.reason}","${m.userName}","${m.timestamp}"\n`;
    });
  } else if (reportType === 'recommendations') {
    const { recommendations } = ReorderService.refreshAllRecommendations();
    csvContent = 'SKU,ProductName,Supplier,InventoryPosition,ExpectedLeadTimeDemand,SafetyStock,ReorderPoint,SuggestedBaseQty,RecommendedOrderQty,SupplierMOQ,SupplierPackSize,EstimatedCost,StockoutRisk\n';
    recommendations.forEach(r => {
      csvContent += `"${r.sku}","${r.productName}","${r.supplierName}",${r.inventoryPosition},${r.expectedLeadTimeDemand},${r.safetyStock},${r.reorderPoint},${r.suggestedBaseOrderQty},${r.recommendedFinalOrderQty},${r.supplierMoq},${r.supplierPackSize},${r.estimatedCost},"${r.stockoutRiskLevel}"\n`;
    });
  } else if (reportType === 'model_benchmarks') {
    csvContent = 'ModelID,ModelName,Algorithm,Status,MAE,RMSE,WAPE,R2,TrainingTimeSec,InferenceLatencyMs,IsProduction\n';
    dbStore.modelExperiments.forEach(m => {
      csvContent += `"${m.modelId}","${m.modelName}","${m.algorithm}","${m.status}",${m.mae || ''},${m.rmse || ''},${m.wape || ''},${m.r2 || ''},${m.trainingTimeSeconds || ''},${m.inferenceLatencyMs || ''},${m.isProduction}\n`;
    });
  } else {
    return res.status(400).json({
      success: false,
      error: 'INVALID_REPORT_TYPE',
      message: 'Supported report types: inventory, movements, recommendations, model_benchmarks'
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvContent);
});

export default router;
