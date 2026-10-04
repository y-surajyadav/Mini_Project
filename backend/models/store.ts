import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { 
  User, 
  Product, 
  Supplier, 
  InventoryMovement, 
  ModelExperiment, 
  StockoutAlert, 
  ReorderRecommendation, 
  AuditLog 
} from './types';
import { CONFIG } from '../config/index';

class OperationalStore {
  public users: Map<string, User> = new Map();
  public suppliers: Map<string, Supplier> = new Map();
  public products: Map<string, Product> = new Map();
  public movements: InventoryMovement[] = [];
  public modelExperiments: Map<string, ModelExperiment> = new Map();
  public stockoutAlerts: Map<string, StockoutAlert> = new Map();
  public reorderRecommendations: Map<string, ReorderRecommendation> = new Map();
  public auditLogs: AuditLog[] = [];
  public productionModelId: string | null = null;

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // 1. Seed Users (Admin & Warehouse Manager)
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('AdminPassword123!', salt);
    const managerHash = bcrypt.hashSync('ManagerPassword123!', salt);

    const adminUser: User = {
      id: 'usr_admin_001',
      username: 'admin',
      name: 'System Administrator',
      email: 'admin@warehouse-xai.org',
      role: 'admin',
      passwordHash: adminHash,
      createdAt: '2026-01-15T08:00:00Z'
    };

    const managerUser: User = {
      id: 'usr_mgr_002',
      username: 'manager',
      name: 'Elena Rostova',
      email: 'manager@warehouse-xai.org',
      role: 'warehouse_manager',
      passwordHash: managerHash,
      createdAt: '2026-01-16T09:30:00Z'
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(managerUser.id, managerUser);

    // 2. Seed Suppliers (Operational Demonstration Data)
    const suppliersList: Supplier[] = [
      {
        id: 'sup_001',
        code: 'SUP-FOOD-01',
        name: 'Direct Harvest Farms',
        contactEmail: 'orders@directharvest.com',
        contactPhone: '+1-555-019-2831',
        leadTimeDays: 3,
        moq: 60,
        packSize: 12,
        active: true,
        createdAt: '2026-01-10T10:00:00Z'
      },
      {
        id: 'sup_002',
        code: 'SUP-HOUSE-02',
        name: 'Pinnacle Household Supplies',
        contactEmail: 'procure@pinnaclehousehold.com',
        contactPhone: '+1-555-014-9920',
        leadTimeDays: 5,
        moq: 100,
        packSize: 20,
        active: true,
        createdAt: '2026-01-11T11:15:00Z'
      },
      {
        id: 'sup_003',
        code: 'SUP-HOBBY-03',
        name: 'Apex Hobbies & Craft Global',
        contactEmail: 'sales@apexhobbies.org',
        contactPhone: '+1-555-017-4822',
        leadTimeDays: 7,
        moq: 40,
        packSize: 10,
        active: true,
        createdAt: '2026-01-12T14:20:00Z'
      },
      {
        id: 'sup_004',
        code: 'SUP-FOOD-04',
        name: 'Metro Dairy & Beverage Dist.',
        contactEmail: 'contact@metrodairy.net',
        contactPhone: '+1-555-012-7711',
        leadTimeDays: 2,
        moq: 80,
        packSize: 24,
        active: true,
        createdAt: '2026-01-13T16:00:00Z'
      }
    ];

    suppliersList.forEach(s => this.suppliers.set(s.id, s));

    // 3. Seed Products (SYNTHETIC DEMONSTRATION DATA)
    // Associated with M5 SKU identifiers, clearly labeled synthetic operational data
    const productsList: Product[] = [
      {
        id: 'prod_001',
        sku: 'FOODS_3_090_CA_3',
        name: 'Organic Honeycrisp Apples 3lb',
        category: 'FOODS',
        deptId: 'FOODS_3',
        storeId: 'CA_3',
        unit: 'Bag',
        onHandStock: 35,
        safetyStock: 50,
        confirmedInbound: 24,
        committedDemand: 15,
        supplierId: 'sup_001',
        unitCost: 2.15,
        sellingPrice: 3.99,
        binLocation: 'A-12-04',
        status: 'active',
        isSyntheticDemo: true,
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-03-25T14:00:00Z'
      },
      {
        id: 'prod_002',
        sku: 'FOODS_3_586_CA_3',
        name: 'Artisan Sourdough Loaf 24oz',
        category: 'FOODS',
        deptId: 'FOODS_3',
        storeId: 'CA_3',
        unit: 'Loaf',
        onHandStock: 12,
        safetyStock: 45,
        confirmedInbound: 0,
        committedDemand: 8,
        supplierId: 'sup_004',
        unitCost: 1.80,
        sellingPrice: 4.49,
        binLocation: 'A-04-02',
        status: 'active',
        isSyntheticDemo: true,
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-03-26T09:30:00Z'
      },
      {
        id: 'prod_003',
        sku: 'HOUSEHOLD_1_001_CA_3',
        name: 'Ultra Clean Disinfectant Wipes 75ct',
        category: 'HOUSEHOLD',
        deptId: 'HOUSEHOLD_1',
        storeId: 'CA_3',
        unit: 'Canister',
        onHandStock: 180,
        safetyStock: 60,
        confirmedInbound: 40,
        committedDemand: 20,
        supplierId: 'sup_002',
        unitCost: 2.90,
        sellingPrice: 5.79,
        binLocation: 'B-08-01',
        status: 'active',
        isSyntheticDemo: true,
        createdAt: '2026-01-21T11:00:00Z',
        updatedAt: '2026-03-27T10:15:00Z'
      },
      {
        id: 'prod_004',
        sku: 'HOBBIES_1_001_CA_3',
        name: 'Classic Acrylic Paint Set 24-Color',
        category: 'HOBBIES',
        deptId: 'HOBBIES_1',
        storeId: 'CA_3',
        unit: 'Set',
        onHandStock: 8,
        safetyStock: 25,
        confirmedInbound: 0,
        committedDemand: 4,
        supplierId: 'sup_003',
        unitCost: 8.50,
        sellingPrice: 19.99,
        binLocation: 'C-02-05',
        status: 'active',
        isSyntheticDemo: true,
        createdAt: '2026-01-22T12:00:00Z',
        updatedAt: '2026-03-28T16:45:00Z'
      },
      {
        id: 'prod_005',
        sku: 'FOODS_2_100_CA_3',
        name: 'Grade A Large Brown Eggs 12ct',
        category: 'FOODS',
        deptId: 'FOODS_2',
        storeId: 'CA_3',
        unit: 'Carton',
        onHandStock: 95,
        safetyStock: 40,
        confirmedInbound: 48,
        committedDemand: 10,
        supplierId: 'sup_001',
        unitCost: 1.65,
        sellingPrice: 3.49,
        binLocation: 'A-01-03',
        status: 'active',
        isSyntheticDemo: true,
        createdAt: '2026-01-23T14:00:00Z',
        updatedAt: '2026-03-29T11:20:00Z'
      }
    ];

    productsList.forEach(p => this.products.set(p.id, p));

    // 4. Seed Inventory Movements Ledger (Audit records)
    this.movements = [
      {
        id: 'mov_001',
        productId: 'prod_001',
        movementType: 'stock_in',
        quantity: 50,
        previousStock: 0,
        newStock: 50,
        referenceNumber: 'GRN-2026-001',
        reason: 'Initial supplier shipment receipt',
        userId: 'usr_admin_001',
        userName: 'System Administrator',
        timestamp: '2026-03-15T09:00:00Z'
      },
      {
        id: 'mov_002',
        productId: 'prod_001',
        movementType: 'stock_out',
        quantity: 15,
        previousStock: 50,
        newStock: 35,
        referenceNumber: 'SO-8921',
        reason: 'Store fulfillment batch dispatch',
        userId: 'usr_mgr_002',
        userName: 'Elena Rostova',
        timestamp: '2026-03-25T14:00:00Z'
      },
      {
        id: 'mov_003',
        productId: 'prod_002',
        movementType: 'stock_out',
        quantity: 18,
        previousStock: 30,
        newStock: 12,
        referenceNumber: 'SO-8934',
        reason: 'Customer fulfillment wave dispatch',
        userId: 'usr_mgr_002',
        userName: 'Elena Rostova',
        timestamp: '2026-03-26T09:30:00Z'
      },
      {
        id: 'mov_004',
        productId: 'prod_004',
        movementType: 'adjustment',
        quantity: -2,
        previousStock: 10,
        newStock: 8,
        referenceNumber: 'ADJ-2026-04',
        reason: 'Damaged packaging during inventory cycle count',
        userId: 'usr_mgr_002',
        userName: 'Elena Rostova',
        timestamp: '2026-03-28T16:45:00Z'
      }
    ];

    // 5. Seed 6 Candidate Models Comparison Metadata
    // Linear Regression, ARIMA, Prophet, XGBoost, LightGBM, CatBoost
    const candidates: ModelExperiment[] = [
      {
        modelId: 'linear_regression',
        modelName: 'Linear Regression (Baseline)',
        algorithm: 'Linear Regression',
        status: 'evaluated',
        mae: 2.142,
        rmse: 3.018,
        wape: 36.42,
        r2: 0.482,
        mape: 41.5,
        trainingTimeSeconds: 4.2,
        inferenceLatencyMs: 0.12,
        splitInfo: { train: 'd_1 to d_1885', val: 'd_1886 to d_1913 (28d)', horizon: 28 },
        featureCount: 10,
        evaluatedAt: '2026-03-28T10:00:00Z',
        isProduction: false
      },
      {
        modelId: 'arima',
        modelName: 'ARIMA (Time-Series Baseline)',
        algorithm: 'ARIMA',
        status: 'evaluated',
        mae: 2.385,
        rmse: 3.241,
        wape: 40.56,
        r2: 0.412,
        mape: 44.8,
        trainingTimeSeconds: 14.8,
        inferenceLatencyMs: 0.85,
        splitInfo: { train: 'd_1 to d_1885', val: 'd_1886 to d_1913 (28d)', horizon: 28 },
        featureCount: 1,
        evaluatedAt: '2026-03-28T10:05:00Z',
        isProduction: false
      },
      {
        modelId: 'prophet',
        modelName: 'Prophet (Trend & Multi-Seasonality)',
        algorithm: 'Prophet',
        status: 'evaluated',
        mae: 1.954,
        rmse: 2.821,
        wape: 33.22,
        r2: 0.548,
        mape: 37.1,
        trainingTimeSeconds: 22.4,
        inferenceLatencyMs: 1.45,
        splitInfo: { train: 'd_1 to d_1885', val: 'd_1886 to d_1913 (28d)', horizon: 28 },
        featureCount: 3,
        evaluatedAt: '2026-03-28T10:12:00Z',
        isProduction: false
      },
      {
        modelId: 'xgboost',
        modelName: 'XGBoost (Extreme Gradient Boosted Trees)',
        algorithm: 'XGBoost',
        status: 'evaluated',
        mae: 1.621,
        rmse: 2.345,
        wape: 27.56,
        r2: 0.687,
        mape: 31.4,
        trainingTimeSeconds: 18.5,
        inferenceLatencyMs: 0.38,
        splitInfo: { train: 'd_1 to d_1885', val: 'd_1886 to d_1913 (28d)', horizon: 28 },
        featureCount: 10,
        evaluatedAt: '2026-03-28T10:20:00Z',
        isProduction: true // Selected as active production model based on validation evidence
      },
      {
        modelId: 'lightgbm',
        modelName: 'LightGBM (Light Gradient Boosting)',
        algorithm: 'LightGBM',
        status: 'evaluated',
        mae: 1.684,
        rmse: 2.412,
        wape: 28.64,
        r2: 0.669,
        mape: 32.8,
        trainingTimeSeconds: 8.2,
        inferenceLatencyMs: 0.22,
        splitInfo: { train: 'd_1 to d_1885', val: 'd_1886 to d_1913 (28d)', horizon: 28 },
        featureCount: 10,
        evaluatedAt: '2026-03-28T10:25:00Z',
        isProduction: false
      },
      {
        modelId: 'catboost',
        modelName: 'CatBoost (Categorical Boosting)',
        algorithm: 'CatBoost',
        status: 'evaluated',
        mae: 1.649,
        rmse: 2.381,
        wape: 28.04,
        r2: 0.678,
        mape: 32.1,
        trainingTimeSeconds: 24.1,
        inferenceLatencyMs: 0.45,
        splitInfo: { train: 'd_1 to d_1885', val: 'd_1886 to d_1913 (28d)', horizon: 28 },
        featureCount: 10,
        evaluatedAt: '2026-03-28T10:32:00Z',
        isProduction: false
      }
    ];

    candidates.forEach(c => {
      this.modelExperiments.set(c.modelId, c);
      if (c.isProduction) this.productionModelId = c.modelId;
    });

    // 6. Seed Initial Audit Logs
    this.auditLogs = [
      {
        id: 'aud_001',
        userId: 'usr_admin_001',
        username: 'admin',
        action: 'SYSTEM_BOOT',
        entity: 'System',
        details: { message: 'Operational store initialized and seeded with synthetic demonstration master data.' },
        timestamp: '2026-03-28T08:00:00Z'
      },
      {
        id: 'aud_002',
        userId: 'usr_admin_001',
        username: 'admin',
        action: 'SELECT_PRODUCTION_MODEL',
        entity: 'ModelExperiment',
        entityId: 'xgboost',
        details: { rationale: 'Lowest validation WAPE (27.56%) and robust TreeExplainer compatibility.' },
        timestamp: '2026-03-28T10:45:00Z'
      }
    ];
  }

  public recordAudit(userId: string, username: string, action: string, entity: string, details: Record<string, any>, entityId?: string) {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      username,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
  }
}

export const dbStore = new OperationalStore();
