export type UserRole = 'admin' | 'warehouse_manager';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  leadTimeDays: number;
  moq: number; // Minimum Order Quantity
  packSize: number; // Pack size multiplier
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'FOODS' | 'HOBBIES' | 'HOUSEHOLD';
  deptId: string;
  storeId: string;
  unit: string;
  onHandStock: number;
  safetyStock: number;
  confirmedInbound: number;
  committedDemand: number;
  supplierId: string;
  unitCost: number;
  sellingPrice: number;
  binLocation: string;
  status: 'active' | 'discontinued';
  isSyntheticDemo: boolean; // Explicitly marks seeded operational records
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'stock_in' | 'stock_out' | 'adjustment' | 'return';

export interface InventoryMovement {
  id: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNumber: string;
  reason: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ModelExperiment {
  modelId: string;
  modelName: string;
  algorithm: string;
  status: 'evaluated' | 'failed' | 'pending';
  mae?: number;
  rmse?: number;
  wape?: number;
  r2?: number;
  mape?: number;
  trainingTimeSeconds?: number;
  inferenceLatencyMs?: number;
  splitInfo: {
    train: string;
    val: string;
    horizon: number;
  };
  featureCount: number;
  failureReason?: string;
  evaluatedAt: string;
  isProduction: boolean;
}

export interface StockoutAlert {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'HEALTHY';
  inventoryPosition: number;
  reorderPoint: number;
  daysOfSupply: number;
  leadTimeDays: number;
  narrative: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export interface ReorderRecommendation {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  onHandStock: number;
  confirmedInbound: number;
  committedDemand: number;
  inventoryPosition: number;
  expectedLeadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  suggestedBaseOrderQty: number;
  recommendedFinalOrderQty: number;
  supplierMoq: number;
  supplierPackSize: number;
  estimatedCost: number;
  stockoutRiskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'HEALTHY';
  riskNarrative: string;
  reviewStatus: 'pending_review' | 'approved_by_manager' | 'rejected';
  managerNotes?: string;
  advisoryNotice: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  entity: string;
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}
