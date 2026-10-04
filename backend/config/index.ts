import path from 'path';

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'xai-smart-warehouse-secret-key-2026-academic',
  JWT_EXPIRES_IN: '24h',
  MONGODB_URI: process.env.MONGODB_URI || '',
  DATASET_DIR: process.env.DATASET_DIR ? path.resolve(process.env.DATASET_DIR) : path.resolve(process.cwd(), 'data'),
  ARTIFACTS_DIR: process.env.ARTIFACTS_DIR ? path.resolve(process.env.ARTIFACTS_DIR) : path.resolve(process.cwd(), 'artifacts'),
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  ROLES: {
    ADMIN: 'admin',
    WAREHOUSE_MANAGER: 'warehouse_manager'
  }
};
