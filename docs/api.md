# REST API Specifications

All endpoints are hosted by Express under `/api/v1` and protected by JWT Bearer authentication where indicated.

## 1. Authentication & Users
- `POST /api/v1/auth/login`
  - Body: `{ username, password }`
  - Returns: `{ token, user: { id, username, name, role, email } }`
- `GET /api/v1/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Returns current user profile and role permissions.
- `GET /api/v1/admin/users` (Admin only)
  - Returns list of system users.
- `POST /api/v1/admin/users` (Admin only)
  - Create a new user (`username`, `name`, `role`, `password`, `email`).
- `PUT /api/v1/admin/users/:id/role` (Admin only)
  - Update user role (`admin` or `warehouse_manager`).

## 2. Products & Suppliers (Separately Maintained Operational Data)
- `GET /api/v1/products`
  - Query: `search`, `category`, `status`, `page`, `limit`
  - Returns paginated product catalog with on-hand stock and safety stock.
- `POST /api/v1/products` (Admin only)
  - Add new product specification.
- `GET /api/v1/suppliers`
  - Query: `search`, `activeOnly`
  - Returns registered suppliers with lead time (days), MOQ, pack size.
- `POST /api/v1/suppliers` (Admin only)
  - Create new supplier profile.

## 3. Inventory Movements Ledger
- `GET /api/v1/inventory/movements`
  - Query: `productId`, `movementType` (`stock_in`, `stock_out`, `adjustment`, `return`), `page`, `limit`
  - Returns chronological immutable ledger records with operator ID and notes.
- `POST /api/v1/inventory/movements` (Admin & Warehouse Manager)
  - Body: `{ productId, movementType, quantity, referenceNumber, reason }`
  - Updates operational stock level and records audit trail.

## 4. Dataset Management & Validation
- `GET /api/v1/dataset/status`
  - Inspects configured `DATASET_DIR`, runs deep schema validation on `sales_train_validation.csv`, `calendar.csv`, `sell_prices.csv`.
  - Returns file presence, row counts, date coverage (`d_1`..`d_1913`), missing value percentages, duplicate key checks, referential integrity.
- `POST /api/v1/dataset/configure-path` (Admin only)
  - Body: `{ datasetDir }`
  - Verifies and updates dataset path resolution.

## 5. Machine Learning Jobs & Comparison
- `GET /api/v1/ml/models`
  - Returns comparative benchmarks of the 6 forecasting candidates:
    1. Linear Regression
    2. ARIMA
    3. Prophet
    4. XGBoost
    5. LightGBM
    6. CatBoost
  - Metrics: MAE, RMSE, WAPE, R², training time (s), inference latency (ms), status.
- `POST /api/v1/ml/train` (Admin only)
  - Body: `{ models: string[], horizon: number, subsetRatio: number }`
  - Submits training job (blocked if dataset files are missing or invalid).
- `POST /api/v1/ml/select-production` (Admin only)
  - Body: `{ modelId, rationale }`
  - Promotes evaluated candidate to Production.

## 6. Demand Forecasting & SHAP Explainability
- `GET /api/v1/forecasts`
  - Query: `productId`, `horizon` (default 28 days)
  - Returns historical actual sales from M5 aligned with 28-day model forecasts. Blocked if no production model exists.
- `GET /api/v1/explainability/shap`
  - Query: `productId`, `targetDay`
  - Returns global feature importance and local per-prediction waterfall attributions.

## 7. Inventory Optimization & Reorder Recommendations
- `GET /api/v1/inventory/recommendations`
  - Computes advisory reorder quantities using:
    - Expected Lead Time Demand = $\sum_{t=1}^{L} \hat{y}_t$
    - Reorder Point = Expected Lead Time Demand + Safety Stock
    - Inventory Position = On-Hand + Confirmed Inbound - Committed
    - Suggested Order Qty = $\max(0, \text{ROP} - \text{IP})$ rounded to Supplier MOQ & Pack Size.
  - Returns advisory recommendations marked with "HUMAN REVIEW REQUIRED".
- `GET /api/v1/inventory/alerts`
  - Returns active stockout risk warnings (Critical, High, Medium, Healthy).

## 8. Audit Logs & Reports
- `GET /api/v1/audit/logs` (Admin only)
- `GET /api/v1/reports/export/:reportType` (CSV export: `inventory`, `movements`, `forecasts`, `recommendations`)
