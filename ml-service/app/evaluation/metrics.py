import numpy as np
from typing import Dict, Any, Optional
from ..schemas.ml_schemas import ModelMetrics

def calculate_metrics(
    y_true: np.ndarray, 
    y_pred: np.ndarray, 
    training_time_seconds: float = 0.0,
    inference_latency_ms: float = 0.0
) -> ModelMetrics:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    
    y_pred_clipped = np.clip(y_pred, 0, None)
    
    mae = float(np.mean(np.abs(y_true - y_pred_clipped)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred_clipped) ** 2)))
    
    total_actual = float(np.sum(y_true))
    total_abs_error = float(np.sum(np.abs(y_true - y_pred_clipped)))
    wape = float((total_abs_error / total_actual) * 100.0) if total_actual > 0 else 0.0
        
    ss_tot = float(np.sum((y_true - np.mean(y_true)) ** 2))
    ss_res = float(np.sum((y_true - y_pred_clipped) ** 2))
    r2 = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0
        
    non_zero_mask = y_true > 0
    if np.any(non_zero_mask):
        mape = float(np.mean(np.abs((y_true[non_zero_mask] - y_pred_clipped[non_zero_mask]) / y_true[non_zero_mask])) * 100.0)
    else:
        mape = None
        
    return ModelMetrics(
        mae=round(mae, 4),
        rmse=round(rmse, 4),
        wape=round(wape, 2),
        r2=round(r2, 4),
        mape=round(mape, 2) if mape is not None else None,
        training_time_seconds=round(training_time_seconds, 2),
        inference_latency_ms=round(inference_latency_ms, 2)
    )
