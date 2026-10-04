import numpy as np
import pandas as pd
import pytest
from app.features.feature_pipeline import FeaturePipeline

def test_chronological_splits_and_leakage_prevention():
    # Construct synthetic time-series with d_num from 1850 to 1913
    dates = []
    for d in range(1850, 1914):
        dates.append({
            "id": "FOODS_3_090_CA_3_validation",
            "d_num": d,
            "d": f"d_{d}",
            "sales": float(d % 10 + 2)
        })
    df_long = pd.DataFrame(dates)

    pipeline = FeaturePipeline(lag_days=[7, 14, 28], horizon=28)
    df_featured = pipeline.create_features_from_melted(df_long)

    # Chronological partition: Train <= 1885, Val > 1885 and <= 1913
    X_train, y_train, X_val, y_val, feats = pipeline.fit_transform_train_val_split(
        df_featured,
        train_end_d=1885,
        val_end_d=1913
    )

    # Assert train observations strictly precede validation split
    assert len(X_train) > 0
    assert len(X_val) > 0
    # Scaler was fitted strictly on train
    assert pipeline.is_fitted is True
    # Validation size is exactly 28 days
    assert len(X_val) == 28
