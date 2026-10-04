# Model Artifacts Directory

This directory stores persisted serializations of trained machine learning forecasting models and associated preprocessing metadata.

## Artifact Structure
When an experiment completes and produces candidate models (Linear Regression, ARIMA, Prophet, XGBoost, LightGBM, CatBoost), serialized artifacts and evaluation cards are written here:

- `{model_id}_{timestamp}.joblib` / `{model_id}.pkl`: Serialized model weights and feature transformers.
- `{model_id}_metrics.json`: Empirical validation scores (MAE, RMSE, WAPE, R², training time, latency).
- `{model_id}_features.json`: Ordered list of input feature names, lag horizons, and encoding mappings to enforce leakage prevention during inference.
- `production_model.json`: Pointer metadata referencing the currently active production model approved by the Admin, including timestamp, selection rationale, and validation metrics.

## Security & Exclusion
Trained model binaries are excluded from Git version control via `.gitignore`.
