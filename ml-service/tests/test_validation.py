import os
import pytest
from app.data.dataset_validator import validate_m5_dataset

def test_missing_dataset_detection():
    # Calling validate_m5_dataset on a non-existent or empty folder must report invalid
    report = validate_m5_dataset(custom_path="/tmp/non_existent_m5_dir")
    assert report.is_valid is False
    assert len(report.remediation_steps) > 0
    assert any("sales_train_validation" in d for d in report.diagnostics)
    assert report.files["sales_train_validation"].exists is False

def test_dataset_directory_absolute_resolution():
    report = validate_m5_dataset(custom_path="./data")
    assert os.path.isabs(report.dataset_dir)
