from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class FileValidationDetail(BaseModel):
    filename: str
    expected_path: str
    exists: bool
    size_bytes: Optional[int] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    missing_columns: List[str] = []
    sample_columns: List[str] = []
    error_message: Optional[str] = None

class DatasetValidationReport(BaseModel):
    is_valid: bool
    dataset_dir: str
    timestamp: str
    files: Dict[str, FileValidationDetail]
    date_coverage: Optional[Dict[str, Any]] = None
    referential_integrity: Optional[Dict[str, Any]] = None
    missing_values_summary: Optional[Dict[str, Any]] = None
    diagnostics: List[str] = []
    remediation_steps: List[str] = []

class TrainJobRequest(BaseModel):
    models: List[str] = Field(default=["linear_regression", "arima", "xgboost", "lightgbm", "catboost"])
    horizon: int = Field(default=28, ge=1, le=56)
    sample_items: Optional[int] = Field(default=50, ge=5, le=1000)

class ModelMetrics(BaseModel):
    mae: float
    rmse: float
    wape: float
    r2: Optional[float] = None
    mape: Optional[float] = None
    training_time_seconds: float
    inference_latency_ms: float

class CandidateEvaluationResult(BaseModel):
    model_id: str
    model_name: str
    algorithm: str
    status: str
    metrics: Optional[ModelMetrics] = None
    split_info: Dict[str, Any]
    feature_count: int
    failure_reason: Optional[str] = None
    evaluated_at: str
    is_production: bool = False

class ProductionSelectionRequest(BaseModel):
    model_id: str
    rationale: str
    selected_by: str = "Admin"
