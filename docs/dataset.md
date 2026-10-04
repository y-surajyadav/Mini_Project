# Walmart M5 Forecasting Dataset Protocol & Validation

## 1. Academic Provenance & Scope
The M5 dataset represents hierarchical point-of-sale data from Walmart, covering stores across three US states (California, Texas, Wisconsin) and three categories (Hobbies, Foods, Household).

### Mandatory Dataset Files:
1. `sales_train_validation.csv`:
   - Contains 30,490 time series.
   - Identifier columns: `id`, `item_id`, `dept_id`, `cat_id`, `store_id`, `state_id`.
   - Daily sales unit counts: `d_1` through `d_1913`.
2. `calendar.csv`:
   - Contains dates, calendar metrics, and event markers for `d_1` through `d_1969`.
   - Special fields: `event_name_1`, `event_type_1`, `event_name_2`, `event_type_2`, `snap_CA`, `snap_TX`, `snap_WI`.
3. `sell_prices.csv`:
   - Historical weekly item selling prices per store (`store_id`, `item_id`, `wm_yr_wk`, `sell_price`).
4. `sales_train_evaluation.csv` (Optional):
   - Extends sales through day `d_1941`.

## 2. Validation & Quality Checks
Before training or evaluation can occur, the dataset engine validates:
1. **File Presence**: Checks existence of `sales_train_validation.csv`, `calendar.csv`, and `sell_prices.csv` in `DATASET_DIR`.
2. **Schema & Header Verification**: Confirms mandatory identifier columns and sequential day columns `d_1` to `d_1913`.
3. **Date Span Coverage**: Validates that calendar dates map continuously without gaps.
4. **Referential Joins**: Checks that every `item_id` and `store_id` in sales has matching price entries in `sell_prices.csv` for active `wm_yr_wk`.
5. **Missing Value Audit**: Flags unexpected NaNs in critical fields.

## 3. Strict Non-Substitution Policy
- No synthetic sales data is generated for training or benchmarking.
- No third-party sales datasets are mixed.
- If files are not present in `data/`, the system issues a structured diagnostic report and blocks ML training and forecasting.

## 4. Separation from Operational Records
Operational warehouse attributes (safety stock, physical bin locations, confirmed supplier purchase orders, committed customer reservations) are maintained in a separate operational ledger and labeled **SYNTHETIC DEMONSTRATION DATA** for instructional clarity.
