import io
import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from backend.main import app
from src.double_ml import fit_linear_dml, predict_ite, save_ite_scores
from src.optimizer_stub import greedy_optimizer
from src.pipeline import detect_and_validate_dataset, run_pipeline, run_allocation

client = TestClient(app)

def test_pipeline_name_error_fixed():
    """Verify Issue 1: discount_amount is accepted, expected gain calculation runs without NameError."""
    # Test on a small mock DataFrame
    df = pd.DataFrame({
        "customer_id": [1, 2, 3, 4],
        "age": [25, 45, 35, 50],
        "loyalty_score": [1.0, 3.0, 5.0, 2.0],
        "past_orders": [2, 10, 5, 8],
        "avg_order_value": [50.0, 80.0, 120.0, 40.0],
        "discount": [0, 1, 0, 1],
        "revenue": [20.0, 100.0, 50.0, 90.0]
    })
    temp_csv = "data/test_temp_retail.csv"
    df.to_csv(temp_csv, index=False)
    
    # Should run end-to-end without NameError ('discount_amout')
    try:
        alloc = run_pipeline(data_path=temp_csv, budget=10.0, discount_amount=2.0)
        assert "discount_amount" in alloc.columns
        assert "expected_gain" in alloc.columns
        assert alloc["discount_amount"].sum() <= 10.0 + 1e-9
    finally:
        import os
        if os.path.exists(temp_csv):
            os.remove(temp_csv)

def test_schema_divergence_and_validation():
    """Verify Issue 2: Both retail and promo schemas are supported, invalid datasets give clear errors."""
    # Valid Retail
    retail_df = pd.DataFrame({
        "customer_id": [1, 2],
        "age": [20, 30],
        "loyalty_score": [1.0, 2.0],
        "past_orders": [1, 2],
        "avg_order_value": [50.0, 60.0],
        "discount": [0, 1],
        "revenue": [10.0, 20.0]
    })
    prepared, schema = detect_and_validate_dataset(retail_df)
    assert schema == "retail"
    assert len(prepared) == 2

    # Valid Processed Promo
    promo_df = pd.DataFrame({
        "customer_id": [1, 2],
        "recency": [5, 10],
        "history": [100.0, 200.0],
        "is_referral": [0, 1],
        "discount": [0, 1],
        "revenue": [0.0, 25.0]
    })
    prepared, schema = detect_and_validate_dataset(promo_df)
    assert schema == "promotion"

    # Missing columns produce clear diagnostic error
    invalid_df = pd.DataFrame({
        "customer_id": [1, 2],
        "age": [20, 30],
        "loyalty_score": [1.0, 2.0]
    })
    with pytest.raises(ValueError) as excinfo:
        detect_and_validate_dataset(invalid_df)
    assert "Retail dataset validation failed" in str(excinfo.value)
    assert "discount" in str(excinfo.value)
    assert "revenue" in str(excinfo.value)

def test_double_ml_feature_export_key_error_fixed():
    """Verify Issue 3: save_ite_scores works with retail schema without KeyError on recency/history."""
    retail_df = pd.DataFrame({
        "customer_id": [101, 102],
        "age": [25, 45],
        "loyalty_score": [1.5, 4.2],
        "past_orders": [3, 8],
        "avg_order_value": [55.0, 120.0],
        "discount": [0, 1],
        "revenue": [30.0, 150.0]
    })
    ite = np.array([2.5, 8.1])
    
    test_out = "data/test_exported_ite.csv"
    try:
        exported = save_ite_scores(retail_df, ite, path=test_out)
        assert "ite" in exported.columns
        assert "customer_id" in exported.columns
        assert "age" in exported.columns
        assert "loyalty_score" in exported.columns
        assert "avg_order_value" in exported.columns
        assert len(exported) == 2
    finally:
        import os
        if os.path.exists(test_out):
            os.remove(test_out)

def test_segment_taxonomy_standardization():
    """Verify Issue 7: Canonical segments 'Persuadables', 'Sure Things', 'Sleeping Dogs'."""
    ite_df = pd.DataFrame({
        "customer_id": [1, 2, 3],
        "ite": [15.0, 0.5, -3.0] # High positive, low positive, negative
    })
    alloc = greedy_optimizer(ite_df, budget=10.0, cost=1.0)
    segments = set(alloc["segment"])
    # 1 is persuadable (chosen), 2 is sure thing, 3 is sleeping dog
    assert "Persuadables" in segments
    assert "Sure Things" in segments
    assert "Sleeping Dogs" in segments
    assert not segments.intersection({"Persuadable", "Sleeping Dog", "Not targeted"})

def test_end_to_end_upload_and_optimization_workflow():
    """Verify Complete Integration Workflow (Issue 9):
    1. Upload CSV to /api/upload
    2. Backend validates, executes DML, returns genuine predictions
    3. /api/ite returns real predictions
    4. /api/allocation returns real allocations
    5. /api/strategy-comparison returns real comparison
    """
    # 1. Upload sample retail data
    with open("data/mock_retail.csv", "rb") as f:
        csv_bytes = f.read()

    res = client.post("/api/upload", files={"file": ("mock_retail.csv", io.BytesIO(csv_bytes), "text/csv")})
    assert res.status_code == 200
    upload_res = res.json()
    assert upload_res["success"] is True
    assert upload_res["schema"] == "retail"
    assert "ate" in upload_res

    # 2. Get genuine ITE predictions
    ite_res = client.get("/api/ite?limit=50")
    assert ite_res.status_code == 200
    ite_records = ite_res.json()
    assert len(ite_records) == 50
    assert all("ite" in r for r in ite_records)

    # 3. Request allocation with different budgets
    for budget in [5000, 25000, 50000]:
        alloc_res = client.get(f"/api/allocation?budget={budget}&discount_amount=10.0")
        assert alloc_res.status_code == 200
        alloc_data = alloc_res.json()
        assert len(alloc_data) > 0
        total_spend = sum(r["discount_amount"] for r in alloc_data)
        assert total_spend <= budget + 1e-6

        # 4. Strategy comparison
        strat_res = client.get(f"/api/strategy-comparison?budget={budget}&discount_amount=10.0")
        assert strat_res.status_code == 200
        strat_data = strat_res.json()
        opt = next(s for s in strat_data if s["strategy"] == "optimized")
        assert opt["total_spend"] <= budget + 1e-6
