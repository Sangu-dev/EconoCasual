import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app
import pandas as pd

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_get_ite():
    res = client.get("/api/ite?limit=5")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 5
    assert "customer_id" in data[0]
    assert "ite" in data[0]
    assert "segment" in data[0]

def test_get_uplift():
    res = client.get("/api/uplift")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "fraction_targeted" in data[0]
    assert "model_gain" in data[0]

def test_get_allocation():
    res = client.get("/api/allocation?budget=500")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "discount_amount" in data[0]
    assert "expected_gain" in data[0]
    assert "segment" in data[0]
    # Check that segment is canonical
    segments = {r["segment"] for r in data}
    assert segments.issubset({"Persuadables", "Sure Things", "Sleeping Dogs", "Lost Causes"})

def test_post_optimize():
    res = client.post("/optimize", json={"budget": 500, "discount_amount": 1.0})
    assert res.status_code == 200
    data = res.json()
    assert "total_spend" in data
    assert "total_gain" in data
    assert "n_targeted" in data
    assert "allocation" in data
    assert data["total_spend"] <= 500.0 + 1e-6

def test_get_strategy_comparison():
    res = client.get("/api/strategy-comparison?budget=500")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 3
    strategies = [d["strategy"] for d in data]
    assert set(strategies) == {"blanket", "random", "optimized"}

def test_upload_invalid_csv():
    # missing discount and revenue
    invalid_csv = b"customer_id,age,loyalty_score,past_orders,avg_order_value\n1,30,5.0,2,100.0\n"
    res = client.post("/api/upload", files={"file": ("invalid.csv", io.BytesIO(invalid_csv), "text/csv")})
    assert res.status_code == 400
    assert "Missing required columns" in res.json()["detail"]

def test_upload_valid_retail_csv():
    # Full mock retail
    df = pd.read_csv("data/mock_retail.csv")
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    res = client.post("/api/upload", files={"file": ("test_retail.csv", buf, "text/csv")})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["schema"] == "retail"
    assert data["rows"] == len(df)
    assert "ate" in data


def test_allocation_and_strategy_various_budgets():
    """Verify Section 5: Both endpoints work with budgets 10000, 25000, 50000 and discount_amount=1."""
    for budget in [10000, 25000, 50000]:
        # Test /api/allocation
        res_alloc = client.get(f"/api/allocation?budget={budget}&discount_amount=1")
        assert res_alloc.status_code == 200
        alloc_data = res_alloc.json()
        assert isinstance(alloc_data, list)
        assert len(alloc_data) > 0
        total_spend = sum(r["discount_amount"] for r in alloc_data)
        assert total_spend <= budget + 1e-6

        # Test /api/strategy-comparison
        res_strat = client.get(f"/api/strategy-comparison?budget={budget}&discount_amount=1")
        assert res_strat.status_code == 200
        strat_data = res_strat.json()
        assert isinstance(strat_data, list)
        assert len(strat_data) == 3
        strat_map = {s["strategy"]: s for s in strat_data}
        assert "optimized" in strat_map
        assert "blanket" in strat_map
        assert "random" in strat_map
        assert strat_map["optimized"]["total_spend"] <= budget + 1e-6


def test_endpoint_validation_and_error_handling():
    """Verify Section 4 & 5: Invalid or serialized object budget produces 422 Unprocessable Entity."""
    # 1. Object serialization bug: budget=[object Object]
    res_alloc_obj = client.get("/api/allocation?budget=[object%20Object]&discount_amount=1")
    assert res_alloc_obj.status_code == 422
    assert "detail" in res_alloc_obj.json()

    res_strat_obj = client.get("/api/strategy-comparison?budget=[object%20Object]&discount_amount=1")
    assert res_strat_obj.status_code == 422
    assert "detail" in res_strat_obj.json()

    # 2. Missing budget on allocation
    res_alloc_missing = client.get("/api/allocation")
    assert res_alloc_missing.status_code == 422

    # 3. Non-positive budget
    res_alloc_neg = client.get("/api/allocation?budget=-1000&discount_amount=1")
    assert res_alloc_neg.status_code == 422

    res_strat_zero = client.get("/api/strategy-comparison?budget=0&discount_amount=1")
    assert res_strat_zero.status_code == 422
