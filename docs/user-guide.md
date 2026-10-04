# Operational User Guide

## 1. System Roles & Access
The platform enforces role-based access control (RBAC):
- **Administrator (`admin`)**: Full authority over product master data, suppliers, inventory ledger, dataset path configuration, training execution, production model promotion, user administration, and system audit logs.
- **Warehouse Manager (`warehouse_manager`)**: Operational permissions to record stock movements (stock-in, stock-out, adjustment, return), monitor stockout alerts, review advisory reorder suggestions, inspect forecasts and SHAP feature attributions, and export operational CSV reports.

## 2. Default Seed Accounts
For local demonstration and evaluation:
- **Admin**:
  - Username: `admin`
  - Password: `AdminPassword123!`
  - Role: `Admin`
- **Warehouse Manager**:
  - Username: `manager`
  - Password: `ManagerPassword123!`
  - Role: `Warehouse Manager`

## 3. Workflow Procedures

### Step 1: Dataset Verification
1. Navigate to the **Dataset Management** tab.
2. Confirm the directory path (default: `./data`).
3. Click **Run Dataset Validation**. The system checks:
   - File presence for `sales_train_validation.csv`, `calendar.csv`, `sell_prices.csv`.
   - Structural headers and date range continuity (`d_1` to `d_1913`).
   - If files are missing, training and forecasting are blocked with clear remediation instructions.

### Step 2: Model Training & Comparison
1. Navigate to **Model Comparison**.
2. If the M5 dataset has been verified, select candidate models (Linear Regression, ARIMA, Prophet, XGBoost, LightGBM, CatBoost) and click **Run Training & Evaluation Job**.
3. Inspect benchmark metrics (MAE, RMSE, WAPE, $R^2$, latency).
4. As Admin, select the best performing model and click **Promote to Production**.

### Step 3: Demand Forecasts & SHAP Interpretability
1. Navigate to **Forecast Explorer**.
2. Select an active SKU and forecast horizon (e.g. 14, 21, or 28 days).
3. View historical actuals plotted alongside model predictions with confidence bands.
4. Open the **Explainability** tab to inspect global feature importance and daily local waterfall attribution values.

### Step 4: Inventory Optimization & Advisory Reorders
1. Navigate to **Alerts & Reorders**.
2. Review calculated:
   - Expected Lead Time Demand ($\text{ELTD}$)
   - Reorder Point ($\text{ROP}$)
   - Current Inventory Position ($\text{IP}$)
   - Advisory Order Quantity (adjusted for Supplier MOQ and Pack Size)
3. Note: All recommendations are decision-support advisory notices and require human sign-off before vendor procurement.
