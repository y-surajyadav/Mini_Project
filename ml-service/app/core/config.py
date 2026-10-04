import os
from pathlib import Path
from pydantic import BaseModel

SERVICE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = SERVICE_DIR.parent if SERVICE_DIR.name == "ml-service" else SERVICE_DIR

def resolve_dataset_dir(custom_path: str = None) -> Path:
    raw_path = custom_path or os.getenv("DATASET_DIR", "./data")
    path_obj = Path(raw_path)
    if path_obj.is_absolute():
        return path_obj.resolve()
    return (PROJECT_ROOT / path_obj).resolve()

def resolve_artifacts_dir(custom_path: str = None) -> Path:
    raw_path = custom_path or os.getenv("ARTIFACTS_DIR", "./artifacts")
    path_obj = Path(raw_path)
    if path_obj.is_absolute():
        return path_obj.resolve()
    return (PROJECT_ROOT / path_obj).resolve()

class Settings(BaseModel):
    PROJECT_NAME: str = "Smart Warehouse Demand Forecasting & Inventory Optimization"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("ML_HOST", "127.0.0.1")
    PORT: int = int(os.getenv("ML_PORT", "8000"))
    DATASET_DIR: Path = resolve_dataset_dir()
    ARTIFACTS_DIR: Path = resolve_artifacts_dir()
    
    SALES_VALIDATION_FILE: str = "sales_train_validation.csv"
    CALENDAR_FILE: str = "calendar.csv"
    SELL_PRICES_FILE: str = "sell_prices.csv"
    SALES_EVALUATION_FILE: str = "sales_train_evaluation.csv"

settings = Settings()
