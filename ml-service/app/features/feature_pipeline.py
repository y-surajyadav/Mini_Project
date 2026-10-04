import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
from sklearn.preprocessing import StandardScaler

class FeaturePipeline:
    def __init__(self, lag_days: List[int] = [7, 14, 28], horizon: int = 28):
        self.lag_days = lag_days
        self.horizon = horizon
        self.scaler = StandardScaler()
        self.feature_names: List[str] = []
        self.is_fitted = False
        
    def create_features_from_melted(self, df_long: pd.DataFrame, calendar_df: pd.DataFrame = None) -> pd.DataFrame:
        df = df_long.copy()
        df = df.sort_values(by=["id", "d_num"]).reset_index(drop=True)
        
        for lag in self.lag_days:
            df[f"sales_lag_{lag}"] = df.groupby("id")["sales"].shift(lag)
            
        base_lag_col = f"sales_lag_{self.horizon}" if f"sales_lag_{self.horizon}" in df.columns else f"sales_lag_{self.lag_days[0]}"
        
        df["rolling_mean_7"] = df.groupby("id")[base_lag_col].transform(lambda x: x.rolling(7, min_periods=1).mean())
        df["rolling_std_7"] = df.groupby("id")[base_lag_col].transform(lambda x: x.rolling(7, min_periods=1).std().fillna(0))
        df["rolling_mean_28"] = df.groupby("id")[base_lag_col].transform(lambda x: x.rolling(28, min_periods=1).mean())
        
        df["wday"] = (df["d_num"] % 7) + 1
        df["month"] = ((df["d_num"] // 30) % 12) + 1
        df["is_event"] = 0
        df["snap_active"] = 0

        max_lag = max(self.lag_days + [self.horizon])
        df = df.dropna(subset=[f"sales_lag_{max_lag}"]).reset_index(drop=True)
        
        feature_cols = [
            f"sales_lag_{lag}" for lag in self.lag_days
        ] + [
            "rolling_mean_7", "rolling_std_7", "rolling_mean_28",
            "wday", "month", "is_event", "snap_active"
        ]
        
        self.feature_names = [col for col in feature_cols if col in df.columns]
        return df

    def fit_transform_train_val_split(
        self, 
        df_featured: pd.DataFrame, 
        train_end_d: int = 1885, 
        val_end_d: int = 1913
    ) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, List[str]]:
        train_mask = df_featured["d_num"] <= train_end_d
        val_mask = (df_featured["d_num"] > train_end_d) & (df_featured["d_num"] <= val_end_d)
        
        X_train_raw = df_featured.loc[train_mask, self.feature_names].fillna(0)
        y_train = df_featured.loc[train_mask, "sales"]
        
        X_val_raw = df_featured.loc[val_mask, self.feature_names].fillna(0)
        y_val = df_featured.loc[val_mask, "sales"]
        
        self.scaler.fit(X_train_raw)
        self.is_fitted = True
        
        X_train = pd.DataFrame(self.scaler.transform(X_train_raw), columns=self.feature_names, index=X_train_raw.index)
        X_val = pd.DataFrame(self.scaler.transform(X_val_raw), columns=self.feature_names, index=X_val_raw.index)
        
        return X_train, y_train, X_val, y_val, self.feature_names
