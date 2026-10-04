import numpy as np
import pytest
from app.evaluation.metrics import calculate_metrics

def test_metric_calculations_exact():
    y_true = np.array([10.0, 20.0, 30.0, 40.0])
    y_pred = np.array([12.0, 18.0, 33.0, 37.0])
    
    metrics = calculate_metrics(y_true, y_pred, training_time_seconds=1.5, inference_latency_ms=0.25)
    
    # MAE = (|10-12| + |20-18| + |30-33| + |40-37|) / 4 = (2 + 2 + 3 + 3) / 4 = 10 / 4 = 2.5
    assert metrics.mae == 2.5
    
    # RMSE = sqrt((4 + 4 + 9 + 9) / 4) = sqrt(26 / 4) = sqrt(6.5) ≈ 2.5495
    assert abs(metrics.rmse - np.sqrt(6.5)) < 1e-3
    
    # WAPE = (sum absolute errors / sum actuals) * 100 = (10 / 100) * 100 = 10.0%
    assert metrics.wape == 10.0
    
    # R2 should be positive and high
    assert metrics.r2 > 0.9
    assert metrics.training_time_seconds == 1.5
    assert metrics.inference_latency_ms == 0.25

def test_zero_demand_mape_handling():
    # Intermittent zero demand series
    y_true = np.array([0.0, 0.0, 10.0, 20.0])
    y_pred = np.array([1.0, 0.0, 11.0, 18.0])
    
    metrics = calculate_metrics(y_true, y_pred)
    # MAPE must not crash with division by zero; must compute on non-zero entries:
    # (|10-11|/10 + |20-18|/20)/2 = (0.1 + 0.1)/2 = 0.1 * 100 = 10%
    assert metrics.mape is not None
    assert metrics.mape == 10.0

def test_negative_prediction_clipping():
    # Retail demand cannot be negative; negative predictions must be clipped to zero
    y_true = np.array([0.0, 5.0])
    y_pred = np.array([-4.0, 5.0])
    metrics = calculate_metrics(y_true, y_pred)
    assert metrics.mae == 0.0
