# Machine Learning Experiments & Explainability Methodology

## 1. Candidate Forecasting Algorithms
The system implements and benchmarks six distinct demand forecasting algorithms:

1. **Linear Regression (Baseline)**:
   - Evaluates linear relationships between lagged sales, moving averages, and promotional prices.
   - Provides an interpretable statistical lower bound.

2. **ARIMA (AutoRegressive Integrated Moving Average)**:
   - Classical univariate time-series model capturing autocorrelation and moving-average error terms.
   - Fitted on historical sales sequences per SKU.

3. **Prophet**:
   - Additive regression model decomposing time series into piecewise linear trends, multi-period seasonalities (weekly, yearly), and holiday/event effects.

4. **XGBoost (Extreme Gradient Boosting)**:
   - Scalable gradient boosted decision tree framework optimizing regularized objective functions.
   - Captures complex non-linear interactions across price momentum, calendar dynamics, and lagged demand.

5. **LightGBM (Light Gradient Boosting Machine)**:
   - Highly efficient gradient boosting framework using histogram-based algorithms and leaf-wise tree growth.
   - Excellent performance on large tabular time-series features.

6. **CatBoost (Categorical Boosting)**:
   - Gradient boosting library handling categorical variables natively with ordered target statistics to combat prediction shift.

## 2. Leakage-Safe Feature Engineering & Splits
- **Chronological Split**: Time series data is partitioned strictly chronologically:
  - Training Set: `d_1` to `d_1885`
  - Validation Set: `d_1886` to `d_1913` (28-day standard forecasting horizon)
- **Lag Features**: Lags are constructed strictly from historical observations ($t-7, t-14, t-28$).
- **Rolling Statistics**: Rolling means and standard deviations are computed strictly on lagged sales (e.g., rolling window applied over $t-28$) to prevent future leakage when forecasting a multi-step horizon.
- **Preprocessing Transformers**: StandardScaler, TargetEncoders, and Imputers are fitted exclusively on training splits.

## 3. Evaluation Metrics
- **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |y_i - \hat{y}_i|$$
- **Root Mean Squared Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2}$$
- **Weighted Absolute Percentage Error (WAPE)**:
  $$\text{WAPE} = \frac{\sum_{i=1}^n |y_i - \hat{y}_i|}{\sum_{i=1}^n y_i} \times 100\%$$
- **Coefficient of Determination ($R^2$)**:
  $$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

## 4. SHAP (SHapley Additive exPlanations)
- **Global Feature Importance**: Ranks features by mean absolute SHAP values across validation samples.
- **Local Attribution**: Decomposes individual daily forecasts into base value + sum of SHAP contributions:
  $$\hat{y}(x) = \phi_0 + \sum_{j=1}^M \phi_j(x)$$
- **Explainers**: Uses `TreeExplainer` for XGBoost, LightGBM, and CatBoost; uses `LinearExplainer` for Linear Regression.
- **Academic Limitation Notice**: SHAP identifies associative feature attribution within model parameters, not real-world causal relationships.
